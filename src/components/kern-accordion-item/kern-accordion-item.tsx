import { Component, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';
import { Icon } from '../../utils/icons';

/**
 * One collapsible section of kern-accordion, on the native `<details>`/`<summary>` (Enter/Space toggle, announced as
 * expanded/collapsed).
 *
 * @slot - Content
 * @slot heading - Heading content (instead of `heading`), e.g. with a kern-badge
 * @part summary - The clickable heading row
 * @part content - The content area
 */
@Component({
  tag: 'kern-accordion-item',
  styleUrl: 'kern-accordion-item.css',
  shadow: true,
})
export class KernAccordionItem {
  @Element() el!: HTMLElement;

  @Prop() heading?: string;
  @Prop({ mutable: true, reflect: true }) open = false;
  /** Cannot be toggled. */
  @Prop({ reflect: true }) disabled = false;

  /** After opening or closing by the user. */
  @Event() kernToggle!: EventEmitter<{ open: boolean }>;

  private details?: HTMLDetailsElement;

  @Watch('open')
  apply() {
    // Via the attribute (same as the property in browsers, and also works in test DOMs).
    const d = this.details;
    if (!d || d.hasAttribute('open') === this.open) return;
    if (this.open) d.setAttribute('open', '');
    else d.removeAttribute('open');
  }

  private onToggle = () => {
    const open = !!this.details?.hasAttribute('open');
    if (open === this.open) return;
    this.open = open;
    this.kernToggle.emit({ open });
  };

  private onSummaryClick = (ev: MouseEvent) => {
    if (this.disabled) ev.preventDefault();
  };

  render() {
    return (
      <Host>
        <details ref={(el) => (this.details = el as HTMLDetailsElement | undefined)} open={this.open} onToggle={this.onToggle}>
          <summary part="summary" aria-disabled={this.disabled ? 'true' : undefined} onClick={this.onSummaryClick}>
            <span class="heading">
              {this.heading}
              <slot name="heading" />
            </span>
            <Icon name="chevron-down" class="chevron" />
          </summary>
          <div class="content" part="content">
            <slot />
          </div>
        </details>
      </Host>
    );
  }
}
