import { AttachInternals, Component, Element, Event, EventEmitter, Host, Listen, Method, Prop, State, h } from '@stencil/core';
import { fieldDisabled } from '../../utils/form-disabled';
import { implicitSubmit } from '../../utils/implicit-submit';
import { positionPopup } from '../../utils/popover';

let nextId = 0;

/** Input types that can show suggestions. */
const SUGGEST_TYPES = ['text', 'search', 'email', 'url', 'tel'];

/**
 * Labelled text field (text, password, search, number …), form-associated.
 * Use `mono` for IP, MAC, CIDR and IDs.
 *
 * `suggestions` turns it into a combobox: typing shows the suggestions that contain the text (case-insensitive) in a
 * list below the field, free text stays allowed. Arrow keys open the list and move, Enter or a click takes a
 * suggestion, Escape and Tab close it. Taking one sets `value` and emits `kernInput` and `kernChange` like typing.
 * Only for `type` text, search, email, url and tel.
 *
 * Native checks (`required`, `type="email"`/`url`, `pattern`, `min`/`max`/`step`, `maxlength`) reach the form: an
 * invalid value blocks submitting. Like `:user-invalid`, the browser's message is shown only after the value was
 * changed or a submit failed. `error` takes priority.
 *
 * Enter submits the surrounding form like a native field (with an open suggestion list it only takes the suggestion);
 * `no-implicit-submit` turns that off.
 *
 * @part control - The native input
 * @part listbox - The suggestion list
 * @part option - Each suggestion
 */
@Component({
  tag: 'kern-input',
  styleUrl: 'kern-input.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernInput {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  /** Error text; also marks the field invalid. */
  @Prop() error?: string;
  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  @Prop() type: 'text' | 'password' | 'search' | 'email' | 'url' | 'number' | 'tel' = 'text';
  @Prop() placeholder?: string;
  @Prop() autocomplete?: string;
  @Prop() pattern?: string;
  @Prop() maxlength?: number;
  /** For `type="number"`. */
  @Prop() min?: number | string;
  @Prop() max?: number | string;
  @Prop() step?: number | string;
  /** Values offered while typing; free text stays allowed. A string is split at commas. */
  @Prop() suggestions?: string[] | string;
  @Prop({ reflect: true }) mono = false;
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  @Prop({ reflect: true }) disabled = false;
  /** Set by a disabled fieldset or form; `disabled` stays the author's own. */
  @State() formDisabled = false;
  @Prop() readonly = false;
  @Prop() required = false;
  /** Enter does not submit the surrounding form. */
  @Prop() noImplicitSubmit = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;

  /** On every keystroke and when a suggestion is taken. */
  @Event() kernInput!: EventEmitter<{ value: string }>;
  /** On every keystroke and when a suggestion is taken (also used by the Angular value accessor). */
  @Event() kernChange!: EventEmitter<{ value: string }>;

  @State() open = false;
  @State() active = -1;
  /** Changed by the user or a failed submit; native problems are shown from then on. */
  @State() touched = false;
  /** The inner input's validation message, read after each render. */
  @State() nativeError = '';

  private input?: HTMLInputElement;
  private popup?: HTMLElement;
  private uid = `kern-input-${++nextId}`;
  private initial = '';

  componentWillLoad() {
    this.initial = this.value ?? '';
  }

  componentDidLoad() {
    this.sync();
  }

  componentDidRender() {
    this.setupPopup();
    // The inner input has the new attributes and value only now.
    this.sync();
  }

  disconnectedCallback() {
    this.stopTracking();
  }

  /** Passes value and validity to the form; native problems of the inner input are mirrored (readonly and disabled are skipped via `willValidate`). */
  private sync() {
    this.internals?.setFormValue?.(this.value ?? '');
    const input = this.input;
    let message = '';
    if (this.error) {
      this.internals?.setValidity?.({ customError: true }, this.error, input);
    } else if (input?.willValidate && !input.validity.valid) {
      const v = input.validity;
      message = input.validationMessage;
      this.internals?.setValidity?.(
        {
          valueMissing: v.valueMissing,
          typeMismatch: v.typeMismatch,
          patternMismatch: v.patternMismatch,
          tooLong: v.tooLong,
          tooShort: v.tooShort,
          rangeUnderflow: v.rangeUnderflow,
          rangeOverflow: v.rangeOverflow,
          stepMismatch: v.stepMismatch,
          badInput: v.badInput,
        },
        message,
        input,
      );
    } else {
      this.internals?.setValidity?.({});
    }
    if (message !== this.nativeError) this.nativeError = message;
  }

  /** Fired by the browser when a submit or `checkValidity()` finds the field invalid. */
  @Listen('invalid')
  onInvalid() {
    this.touched = true;
  }

  formResetCallback() {
    this.value = this.initial;
    this.touched = false;
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
  }

  /** Focuses the native input. */
  @Method()
  async setFocus() {
    this.input?.focus();
  }

  /** Selects the text. */
  @Method()
  async select() {
    this.input?.select();
  }

  // ---------- suggestions ----------

  private get suggestionList(): string[] {
    const s = this.suggestions;
    if (!s || !SUGGEST_TYPES.includes(this.type)) return [];
    const list = Array.isArray(s) ? s : s.split(',');
    return [...new Set(list.map((v) => String(v).trim()).filter(Boolean))];
  }

  /** Suggestions containing the typed text, ignoring case. */
  private get hits(): string[] {
    const q = (this.value ?? '').trim().toLowerCase();
    return this.suggestionList.filter((s) => !q || s.toLowerCase().includes(q));
  }

  /** The popover is created once there are suggestions; `popover` is set here, not in JSX (older DOM typings). */
  private setupPopup() {
    const p = this.popup;
    if (!p || p.hasAttribute('popover')) return;
    p.setAttribute('popover', 'auto');
    p.addEventListener('toggle', (e) => this.onToggle(e as ToggleEvent));
  }

  private openList() {
    if (fieldDisabled(this) || this.readonly || !this.popup || !this.hits.length) return;
    this.open = true;
    this.position();
    const p = this.popup as HTMLElement & { showPopover?: () => void };
    if (!safeMatches(p, ':popover-open')) p.showPopover?.();
  }

  private closeList() {
    this.open = false;
    this.active = -1;
    const p = this.popup as (HTMLElement & { hidePopover?: () => void }) | undefined;
    if (p && safeMatches(p, ':popover-open')) p.hidePopover?.();
  }

  private onToggle(e: ToggleEvent) {
    if (e.newState === 'open') {
      this.position();
      this.startTracking();
    } else {
      this.stopTracking();
      // Light dismiss (click outside, Escape) closed it.
      this.open = false;
      this.active = -1;
    }
  }

  private reposition = () => this.position();

  private startTracking() {
    window.addEventListener('scroll', this.reposition, true);
    window.addEventListener('resize', this.reposition);
  }

  private stopTracking() {
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
  }

  private position() {
    if (this.input && this.popup) positionPopup(this.input, this.popup, { matchWidth: true, maxHeight: 280 });
  }

  private take(i: number) {
    const s = this.hits[i];
    if (s === undefined) return;
    this.closeList();
    this.setValue(s);
  }

  private setValue(value: string) {
    this.value = value;
    if (this.input && this.input.value !== value) this.input.value = value;
    this.kernInput.emit({ value: this.value });
    this.kernChange.emit({ value: this.value });
  }

  private moveTo(i: number) {
    this.active = i;
    requestAnimationFrame(() => this.popup?.querySelector<HTMLElement>(`#${this.uid}-opt-${i}`)?.scrollIntoView?.({ block: 'nearest' }));
  }

  // ---------- events ----------

  private onInput = (ev: Event) => {
    this.setValue((ev.target as HTMLInputElement).value);
    if (!this.suggestionList.length) return;
    this.active = -1;
    if (this.hits.length) this.openList();
    else this.closeList();
  };

  private onKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter' && !this.open) {
      // The form reads value and validity from internals, which otherwise update after the next render.
      this.sync();
      implicitSubmit(this, ev);
      return;
    }
    if (!this.suggestionList.length) return;
    const n = this.hits.length;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      if (!n || fieldDisabled(this) || this.readonly) return;
      ev.preventDefault();
      const down = ev.key === 'ArrowDown';
      if (!this.open) {
        this.openList();
        this.moveTo(down ? 0 : n - 1);
      } else {
        this.moveTo(down ? Math.min(this.active + 1, n - 1) : Math.max(this.active - 1, 0));
      }
    } else if (ev.key === 'Enter') {
      // The list is open: Enter takes the active suggestion or only closes the list, it does not submit.
      if (this.active >= 0 && this.active < n) {
        ev.preventDefault();
        this.take(this.active);
      } else {
        this.closeList();
      }
    } else if (ev.key === 'Escape') {
      if (this.open) {
        // Only close; type="search" would also clear the text.
        ev.preventDefault();
        this.closeList();
      }
    } else if (ev.key === 'Tab') {
      this.closeList();
    }
  };

  private onBlur = () => {
    if (this.open) this.closeList();
  };

  /** Fires after the user changed the value (on blur or Enter), like `:user-invalid`. */
  private onChange = () => {
    this.touched = true;
  };

  /** The typed text in a suggestion, highlighted. */
  private renderMatch(s: string) {
    const q = (this.value ?? '').trim();
    const at = q ? s.toLowerCase().indexOf(q.toLowerCase()) : -1;
    if (at < 0) return s;
    return [s.slice(0, at), <mark>{s.slice(at, at + q.length)}</mark>, s.slice(at + q.length)];
  }

  render() {
    const message = this.error || (this.touched ? this.nativeError : '');
    const describedBy = message ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    const combo = this.suggestionList.length > 0;
    const matches = combo ? this.hits : [];
    const listId = `${this.uid}-list`;
    const activeId = this.open && this.active >= 0 && this.active < matches.length ? `${this.uid}-opt-${this.active}` : undefined;
    return (
      <Host invalid={!!message}>
        {this.label && (
          <label class="label" htmlFor={this.uid}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={(el) => (this.input = el)}
          id={this.uid}
          class="control"
          part="control"
          type={this.type}
          name={this.name}
          placeholder={this.placeholder}
          autocomplete={this.autocomplete ?? (this.type === 'password' || combo ? 'off' : undefined)}
          pattern={this.pattern}
          maxLength={this.maxlength}
          min={this.min}
          max={this.max}
          step={this.step}
          value={this.value}
          disabled={fieldDisabled(this)}
          readOnly={this.readonly}
          required={this.required}
          spellcheck={false}
          role={combo ? 'combobox' : undefined}
          aria-autocomplete={combo ? 'list' : undefined}
          aria-expanded={combo ? (this.open ? 'true' : 'false') : undefined}
          aria-controls={combo ? listId : undefined}
          aria-activedescendant={activeId}
          aria-label={this.label ? undefined : this.ariaLabelText}
          aria-invalid={message ? 'true' : undefined}
          aria-describedby={describedBy}
          onInput={this.onInput}
          onKeyDown={this.onKeyDown}
          onBlur={this.onBlur}
          onChange={this.onChange}
        />
        {combo && (
          <div ref={(el) => (this.popup = el)} class="popup" part="listbox">
            <div id={listId} class="listbox" role="listbox" aria-label={this.label ?? this.ariaLabelText}>
              {matches.map((s, i) => (
                <div
                  id={`${this.uid}-opt-${i}`}
                  class={{ option: true, active: i === this.active }}
                  part="option"
                  role="option"
                  aria-selected={i === this.active ? 'true' : 'false'}
                  // Keep focus in the input.
                  onPointerDown={(e) => e.preventDefault()}
                  onPointerMove={() => {
                    if (i !== this.active) this.active = i;
                  }}
                  onClick={() => this.take(i)}
                >
                  <span class="text">{this.renderMatch(s)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {message ? (
          <span class="error" id={`${this.uid}-error`}>
            {message}
          </span>
        ) : (
          this.hint && (
            <span class="hint" id={`${this.uid}-hint`}>
              {this.hint}
            </span>
          )
        )}
      </Host>
    );
  }
}

/** `el.matches(selector)` that is false where the selector is unknown (test DOM, browsers without popovers). */
function safeMatches(el: HTMLElement, selector: string): boolean {
  try {
    return !!el.matches?.(selector);
  } catch {
    return false;
  }
}
