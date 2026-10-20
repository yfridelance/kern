import { Component, Element, Host, Prop, State, h } from '@stencil/core';
import { kernTexts } from '../../utils/i18n';

/**
 * List of rows (devices, settings, events): kern-list-item children, separated by lines, in a bordered box.
 * `flush` drops the box, e.g. inside kern-card. Shows `empty` when there are no items.
 *
 * `variant="nav"` is a side navigation: compact rows without lines or box, rounded hover, and `current` on the
 * item of the open page. With `heading` the list gets a visible group title that also names it; several nav
 * lists in a row form groups.
 *
 * @slot - kern-list-item elements
 * @part heading - The group title
 * @part list - The list box
 * @part empty - The text shown without items
 */
@Component({
  tag: 'kern-list',
  styleUrl: 'kern-list.css',
  shadow: true,
})
export class KernList {
  @Element() el!: HTMLElement;

  /** Without border and background, e.g. inside kern-card. */
  @Prop({ reflect: true }) flush = false;
  /** `nav` = side navigation: compact rows without lines and box. */
  @Prop({ reflect: true }) variant: 'default' | 'nav' = 'default';
  /** `sm` = denser rows. */
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  /** Shown when there are no items; empty string shows nothing. */
  @Prop() empty?: string;
  private t = kernTexts(this, 'kern-list');
  /** Accessible name of the list. */
  @Prop() label?: string;
  /** Visible group title above the rows; names the list instead of `label`. */
  @Prop() heading?: string;

  @State() count = 0;

  componentWillLoad() {
    this.count = this.el.children.length;
  }

  render() {
    return (
      <Host>
        {this.heading && (
          <div class="heading" part="heading" id="heading">
            {this.heading}
          </div>
        )}
        <div class="list" part="list" role="list" aria-label={this.heading ? undefined : this.label} aria-labelledby={this.heading ? 'heading' : undefined} hidden={!this.count}>
          <slot onSlotchange={(e) => (this.count = (e.target as HTMLSlotElement).assignedElements().length)} />
        </div>
        {!this.count && this.t('empty') && (
          <div class="empty" part="empty">
            {this.t('empty')}
          </div>
        )}
      </Host>
    );
  }
}
