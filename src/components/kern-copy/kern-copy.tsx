import { Component, Element, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { kernTexts } from '../../utils/i18n';

/**
 * Technical value in monospace with a copy button (MAC, IP, device ID, commands).
 * The button stops click propagation so a clickable table row does not open.
 *
 * @slot - Displayed text (defaults to `value`)
 * @part button - The copy button
 */
@Component({
  tag: 'kern-copy',
  styleUrl: 'kern-copy.css',
  shadow: true,
})
export class KernCopy {
  @Element() el!: HTMLElement;

  /** Copied text; defaults to the text content. */
  @Prop() value?: string;
  /** Tooltip and accessible label of the button. */
  @Prop() label?: string;
  private t = kernTexts(this, 'kern-copy');

  /** After a successful copy. */
  @Event() kernCopy!: EventEmitter<{ value: string }>;

  @State() copied = false;

  private timer?: ReturnType<typeof setTimeout>;

  private get text(): string {
    return this.value ?? this.el.textContent?.trim() ?? '';
  }

  private onClick = async (ev: MouseEvent) => {
    ev.stopPropagation();
    const v = this.text;
    try {
      await navigator.clipboard.writeText(v);
    } catch {
      return; // clipboard blocked (no secure context)
    }
    this.copied = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => (this.copied = false), 1200);
    this.kernCopy.emit({ value: v });
  };

  disconnectedCallback() {
    clearTimeout(this.timer);
  }

  render() {
    return (
      <Host data-copied={this.copied ? '' : undefined}>
        <span class="text">
          <slot>{this.value}</slot>
        </span>
        <button type="button" part="button" aria-label={`${this.t('label')}: ${this.text}`} title={this.t('label')} onClick={this.onClick}>
          <Icon name={this.copied ? 'check' : 'copy'} />
        </button>
      </Host>
    );
  }
}
