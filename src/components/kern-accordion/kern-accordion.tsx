import { Component, Element, Host, Listen, Prop, h } from '@stencil/core';

/**
 * Collapsible sections (advanced settings, FAQ, log groups): kern-accordion-item children in a bordered box.
 * Without `multiple` opening one closes the others.
 *
 * @slot - kern-accordion-item elements
 */
@Component({
  tag: 'kern-accordion',
  styleUrl: 'kern-accordion.css',
  shadow: true,
})
export class KernAccordion {
  @Element() el!: HTMLElement;

  /** Several sections may be open at once. */
  @Prop() multiple = false;
  /** Without border and background, e.g. inside kern-card. */
  @Prop({ reflect: true }) flush = false;

  @Listen('kernToggle')
  onToggle(ev: CustomEvent<{ open: boolean }>) {
    if (this.multiple || !ev.detail.open) return;
    const opened = ev.target as HTMLElement;
    for (const item of Array.from(this.el.children) as (HTMLElement & { open?: boolean })[]) {
      if (item !== opened && item.localName === 'kern-accordion-item' && item.open) item.open = false;
    }
  }

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
