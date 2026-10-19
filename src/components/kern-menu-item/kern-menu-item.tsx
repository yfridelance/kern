import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { Icon, type IconName } from '../../utils/icons';

/**
 * One action in kern-menu, with optional icon; `tone="danger"` for destructive actions (Werksreset, Löschen).
 *
 * @slot - Text
 */
@Component({
  tag: 'kern-menu-item',
  styleUrl: 'kern-menu-item.css',
  shadow: true,
})
export class KernMenuItem {
  /** Passed in `kernSelect`; defaults to the text. */
  @Prop() value?: string;
  /** Glyph name (see kern-icon). */
  @Prop() icon?: IconName;
  @Prop({ reflect: true }) tone: 'default' | 'danger' = 'default';
  @Prop({ reflect: true }) disabled = false;

  /** Asks the menu to pick this item (internal). */
  @Event({ bubbles: true, composed: true }) kernMenuItemSelect!: EventEmitter<{ value: string }>;

  private pick = (ev: Event) => {
    const host = ev.currentTarget as HTMLElement;
    if (this.disabled) return;
    this.kernMenuItemSelect.emit({ value: this.value ?? host.textContent?.trim() ?? '' });
  };

  private onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this.pick(ev);
    }
  };

  render() {
    return (
      // Inline style: the page's global :focus-visible ring would beat :host rules; the row highlight shows focus.
      <Host style={{ outline: 'none' }} role="menuitem" tabindex={-1} aria-disabled={this.disabled ? 'true' : undefined} onClick={this.pick} onKeyDown={this.onKey}>
        {this.icon && <Icon name={this.icon} class="icon" />}
        <span class="text">
          <slot />
        </span>
      </Host>
    );
  }
}
