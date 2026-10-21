import { Component, Element, Host, Prop, State, h } from '@stencil/core';
import { kernTexts } from '../../utils/i18n';
import { Icon, type GlyphName } from '../../utils/icons';

const GLYPH = { empty: 'inbox', 'no-results': 'search', error: 'warn' } as const;
const HEADING = { empty: 'headingEmpty', 'no-results': 'headingNoResults', error: 'headingError' } as const;

/**
 * Placeholder where content would be: nothing created yet (`empty`), no matches for the current filters
 * (`no-results`) or the data could not be loaded (`error`). Icon, heading, a sentence and the actions that help,
 * e.g. «Add device», «Reset filters» or «Try again». The app decides which state applies; for a lost connection
 * with data already shown, keep the data and put a kern-alert above it instead.
 *
 * Only `error` is a live region (`role="status"`, announced once when it appears). The heading is plain text, so
 * it does not change the page outline; `heading-level` makes it a heading for screen readers when the state
 * replaces a whole page section.
 *
 * @slot - Description: one or two sentences
 * @slot actions - Buttons, e.g. a kern-button
 * @part icon - The icon
 * @part heading - The heading
 */
@Component({
  tag: 'kern-empty-state',
  styleUrl: 'kern-empty-state.css',
  shadow: true,
})
export class KernEmptyState {
  @Element() el!: HTMLElement;

  /** Which state: sets the default icon and heading. */
  @Prop({ reflect: true }) variant: 'empty' | 'no-results' | 'error' = 'empty';
  /** Heading; defaults to a Kern text per variant («No entries yet», «No matches», «Could not load»). */
  @Prop() heading?: string;
  /** Glyph instead of the variant's default (see kern-icon); `none` hides the icon. */
  @Prop() icon?: GlyphName | 'none';
  /** Less space and a smaller icon, e.g. in a table cell or a card. */
  @Prop({ reflect: true }) compact = false;
  /** Exposes the heading as a heading of this level (1–6) to screen readers, without changing its look. */
  @Prop() headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  private t = kernTexts(this, 'kern-empty-state');

  @State() hasActions = false;

  componentWillLoad() {
    this.hasActions = Array.from(this.el.children).some((c) => c.getAttribute('slot') === 'actions');
  }

  render() {
    const variant = GLYPH[this.variant] ? this.variant : 'empty';
    const icon = this.icon ?? GLYPH[variant];
    const level = Number(this.headingLevel);
    const heading = this.heading ?? this.t(HEADING[variant]);
    return (
      <Host role={variant === 'error' ? 'status' : undefined}>
        {icon !== 'none' && (
          <span class="icon" part="icon">
            <Icon name={icon} />
          </span>
        )}
        {heading && (
          <div class="heading" part="heading" role={level >= 1 && level <= 6 ? 'heading' : undefined} aria-level={level >= 1 && level <= 6 ? String(level) : undefined}>
            {heading}
          </div>
        )}
        <div class="body">
          <slot />
        </div>
        <div class="actions" hidden={!this.hasActions}>
          <slot name="actions" onSlotchange={(e) => (this.hasActions = (e.target as HTMLSlotElement).assignedElements().length > 0)} />
        </div>
      </Host>
    );
  }
}
