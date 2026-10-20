import { Component, Element, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';

import { KernNavigateDetail, isPlainNavigation } from '../../utils/navigate';

type SlotName = 'start' | 'description' | 'meta' | 'end';

/**
 * One row of kern-list: optional icon or status at the start, heading and description, meta text (e.g. a time) and
 * actions at the end. With `href` the row is a link, with `clickable` a button (`kernItemClick`); actions in the
 * `end` slot sit beside it, so clicking them never triggers the row.
 *
 * @slot - Heading (instead of `heading`)
 * @slot start - Icon, kern-status or avatar
 * @slot description - Second line (instead of `description`)
 * @slot meta - Right-aligned meta, e.g. kern-date relative (instead of `meta`)
 * @slot end - Actions, e.g. kern-button size="sm" variant="ghost"
 * @part row - The link, button or plain row
 */
@Component({
  tag: 'kern-list-item',
  styleUrl: 'kern-list-item.css',
  shadow: { delegatesFocus: true },
})
export class KernListItem {
  @Element() el!: HTMLElement;

  @Prop() heading?: string;
  @Prop() description?: string;
  /** Right-aligned, muted (time, count, size). */
  @Prop() meta?: string;
  /** Turns the row into a link. */
  @Prop() href?: string;
  @Prop() target?: string;
  /** Turns the row into a button that emits `kernItemClick`. */
  @Prop() clickable = false;
  /** Marks the current row (`aria-current`). */
  @Prop({ reflect: true }) selected = false;
  @Prop({ reflect: true }) disabled = false;

  /** Click or Enter/Space on a `clickable` row. */
  @Event() kernItemClick!: EventEmitter<void>;
  /**
   * With `href`: plain left click (no modifier keys, `target`) before the browser navigates.
   * `preventDefault()` stops the navigation, so a SPA router can take over.
   */
  @Event({ cancelable: true }) kernNavigate!: EventEmitter<KernNavigateDetail>;

  @State() slots: Record<SlotName, boolean> = { start: false, description: false, meta: false, end: false };

  componentWillLoad() {
    const names = Array.from(this.el.children).map((c) => c.getAttribute('slot'));
    this.slots = { start: names.includes('start'), description: names.includes('description'), meta: names.includes('meta'), end: names.includes('end') };
  }

  private onSlot = (name: SlotName) => (e: Event) => {
    const has = (e.target as HTMLSlotElement).assignedElements().length > 0;
    if (has !== this.slots[name]) this.slots = { ...this.slots, [name]: has };
  };

  private onClick = () => {
    if (!this.disabled) this.kernItemClick.emit();
  };

  private onLinkClick = (ev: MouseEvent) => {
    if (isPlainNavigation(ev, this.target) && this.kernNavigate.emit({ href: this.href!, event: ev }).defaultPrevented) ev.preventDefault();
  };

  private renderMain() {
    const s = this.slots;
    return [
      <span class="start" hidden={!s.start}>
        <slot name="start" onSlotchange={this.onSlot('start')} />
      </span>,
      <span class="text">
        <span class="heading">
          {/* Not a slot fallback: whitespace between child elements would fill the default slot and hide it. */}
          {this.heading}
          <slot />
        </span>
        <span class="description" hidden={!s.description && !this.description}>
          <slot name="description" onSlotchange={this.onSlot('description')}>
            {this.description}
          </slot>
        </span>
      </span>,
      <span class="meta" hidden={!s.meta && !this.meta}>
        <slot name="meta" onSlotchange={this.onSlot('meta')}>
          {this.meta}
        </slot>
      </span>,
    ];
  }

  render() {
    const current = this.selected ? 'true' : undefined;
    const link = this.href && !this.disabled;
    return (
      <Host role="listitem" class={{ 'has-end': this.slots.end }}>
        {link ? (
          <a class="row interactive" part="row" href={this.href} target={this.target} rel={this.target === '_blank' ? 'noopener noreferrer' : undefined} aria-current={current} onClick={this.onLinkClick}>
            {this.renderMain()}
          </a>
        ) : this.clickable ? (
          <button class="row interactive" part="row" type="button" disabled={this.disabled} aria-current={current} onClick={this.onClick}>
            {this.renderMain()}
          </button>
        ) : (
          <div class="row" part="row" aria-current={current}>
            {this.renderMain()}
          </div>
        )}
        <span class="end" hidden={!this.slots.end}>
          <slot name="end" onSlotchange={this.onSlot('end')} />
        </span>
      </Host>
    );
  }
}
