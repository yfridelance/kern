import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { Icon } from '../../utils/icons';

let nextId = 0;

/**
 * Star rating 1–`max`, form-associated (value 0 = not rated). A radio group with one tab stop: arrow keys change the
 * rating, Home/End jump, with `clearable` 0/Backspace or a click on the current star clears it. Hovering previews.
 * `readonly` only shows the rating („4 von 5 Sternen“).
 *
 * @part star - Each star
 */
@Component({
  tag: 'kern-rating',
  styleUrl: 'kern-rating.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernRating {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  /** Number of filled stars, 0 = not rated. */
  @Prop({ mutable: true }) value = 0;
  @Prop() name?: string;
  /** Number of stars. */
  @Prop() max = 5;
  /** Allows going back to 0 (not rated). */
  @Prop() clearable = false;
  /** Display only, no interaction. */
  @Prop({ reflect: true }) readonly = false;
  @Prop({ reflect: true }) disabled = false;
  @Prop() required = false;
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;
  /** Name of each star and the read-only rating; `{n}` and `{max}` are replaced. */
  @Prop() labelValue = '{n} von {max} Sternen';

  /** When the rating changes. */
  @Event() kernChange!: EventEmitter<{ value: number }>;

  @State() preview = 0;

  private stars: HTMLElement[] = [];
  private id = `kern-rating-${++nextId}`;
  private initial = 0;

  componentWillLoad() {
    this.initial = this.current;
  }

  componentDidLoad() {
    this.sync();
  }

  /** The value as a whole number within 0…max. */
  private get current(): number {
    const n = Math.round(Number(this.value) || 0);
    return Math.max(0, Math.min(this.max, n));
  }

  @Watch('value')
  @Watch('error')
  @Watch('required')
  sync() {
    const v = this.current;
    this.internals?.setFormValue?.(v ? String(v) : '');
    const anchor = this.stars[Math.max(0, v - 1)];
    if (this.error) this.internals?.setValidity?.({ customError: true }, this.error, anchor);
    else if (this.required && !v) this.internals?.setValidity?.({ valueMissing: true }, 'required', anchor);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = this.initial;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  /** Focuses the selected star (or the first). */
  @Method()
  async setFocus() {
    this.stars[Math.max(0, this.current - 1)]?.focus();
  }

  private text(n: number): string {
    return this.labelValue.replace('{n}', String(n)).replace('{max}', String(this.max));
  }

  private set(n: number, focus = false) {
    if (this.disabled || this.readonly) return;
    const next = Math.max(this.clearable ? 0 : 1, Math.min(this.max, n));
    if (next !== this.current) {
      this.value = next;
      this.kernChange.emit({ value: next });
    }
    if (focus) requestAnimationFrame(() => this.setFocus());
  }

  private onClick = (n: number) => () => this.set(this.clearable && n === this.current ? 0 : n);

  private onKey = (ev: KeyboardEvent) => {
    const v = this.current;
    const moves: Record<string, number> = { ArrowRight: v + 1, ArrowUp: v + 1, ArrowLeft: v - 1, ArrowDown: v - 1, Home: 1, End: this.max };
    if (ev.key in moves) {
      ev.preventDefault();
      this.set(moves[ev.key], true);
    } else if (this.clearable && ['0', 'Backspace', 'Delete'].includes(ev.key)) {
      ev.preventDefault();
      this.set(0, true);
    } else if (/^[1-9]$/.test(ev.key) && +ev.key <= this.max) {
      ev.preventDefault();
      this.set(+ev.key, true);
    }
  };

  render() {
    const v = this.current;
    const shown = this.preview || v;
    const describedBy = this.error ? `${this.id}-error` : this.hint ? `${this.id}-hint` : undefined;
    const labelId = this.label ? `${this.id}-label` : undefined;
    const interactive = !this.readonly && !this.disabled;
    const n = Array.from({ length: this.max }, (_, i) => i + 1);
    this.stars = [];
    return (
      <Host invalid={!!this.error}>
        {this.label && (
          <span class="label" id={labelId}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </span>
        )}
        {this.readonly ? (
          <span class="stars" role="img" aria-label={[this.label ?? this.ariaLabelText, this.text(v)].filter(Boolean).join(': ')}>
            {n.map((i) => (
              <span class={{ star: true, filled: i <= v }} part="star">
                <Icon name="star" />
              </span>
            ))}
          </span>
        ) : (
          <span
            class="stars"
            role="radiogroup"
            aria-labelledby={labelId}
            aria-label={this.label ? undefined : this.ariaLabelText}
            aria-describedby={describedBy}
            aria-required={this.required ? 'true' : undefined}
            aria-invalid={this.error ? 'true' : undefined}
            aria-disabled={this.disabled ? 'true' : undefined}
            onKeyDown={this.onKey}
            onMouseLeave={() => (this.preview = 0)}
          >
            {n.map((i) => (
              <span
                ref={(el) => el && (this.stars[i - 1] = el)}
                class={{ star: true, filled: i <= shown, preview: !!this.preview && i <= this.preview }}
                part="star"
                role="radio"
                aria-checked={i === v ? 'true' : 'false'}
                aria-label={this.text(i)}
                tabindex={interactive && i === Math.max(1, v) ? 0 : -1}
                onClick={this.onClick(i)}
                onMouseEnter={() => interactive && (this.preview = i)}
              >
                <Icon name="star" />
              </span>
            ))}
          </span>
        )}
        {this.error ? (
          <span class="error" id={`${this.id}-error`}>
            {this.error}
          </span>
        ) : (
          this.hint && (
            <span class="hint" id={`${this.id}-hint`}>
              {this.hint}
            </span>
          )
        )}
      </Host>
    );
  }
}
