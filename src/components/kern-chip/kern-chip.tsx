import { Component, Element, Event, EventEmitter, Host, Method, Prop, h, forceUpdate } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { kernTexts } from '../../utils/i18n';

/**
 * Compact pill for an active filter, a selected value or a tag. `removable` adds a × button (one tab stop per chip);
 * × or Delete/Backspace on it emits `kernRemove`. The chip does not remove itself: the app updates its state and
 * moves the focus, e.g. with `setFocus()` to the next chip or back to the search field.
 *
 * @slot - Chip text
 * @part remove - The × button
 */
@Component({
  tag: 'kern-chip',
  styleUrl: 'kern-chip.css',
  shadow: true,
})
export class KernChip {
  @Element() el!: HTMLElement;

  /** Value sent with `kernRemove`; defaults to the chip text. */
  @Prop() value?: string;
  /** Shows a × button that emits `kernRemove`. */
  @Prop({ reflect: true }) removable = false;
  @Prop({ reflect: true }) tone: 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' = 'neutral';
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  /** Accessible name of the ×; `{label}` is replaced by the chip text. */
  @Prop() labelRemove?: string;

  /** × clicked or Delete/Backspace pressed on it. */
  @Event() kernRemove!: EventEmitter<{ value: string }>;

  private t = kernTexts(this, 'kern-chip');

  private button?: HTMLButtonElement;
  private observer?: MutationObserver;

  connectedCallback() {
    // The × label follows the text, also when a framework changes a text node in place (no slotchange then).
    if (typeof MutationObserver === 'undefined') return; // server-side / test DOM
    this.observer = new MutationObserver(() => forceUpdate(this));
    this.observer.observe(this.el, { childList: true, subtree: true, characterData: true });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  /** Focuses the × (removable chips only), e.g. the next chip after one was removed. */
  @Method()
  async setFocus() {
    this.button?.focus();
  }

  private get text() {
    return (this.el.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  private emitRemove = () => this.kernRemove.emit({ value: this.value ?? this.text });

  private onKey = (ev: KeyboardEvent) => {
    if (ev.key !== 'Delete' && ev.key !== 'Backspace') return;
    ev.preventDefault();
    this.emitRemove();
  };

  render() {
    const label = this.t('labelRemove').replace('{label}', this.text);
    return (
      <Host>
        <span class="label">
          <slot />
        </span>
        {this.removable && (
          <button ref={(el) => (this.button = el)} type="button" class="remove" part="remove" aria-label={label} title={label} onClick={this.emitRemove} onKeyDown={this.onKey}>
            <Icon name="close" />
          </button>
        )}
      </Host>
    );
  }
}
