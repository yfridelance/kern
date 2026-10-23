import { Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { kernTexts } from '../../utils/i18n';
import { Icon, type GlyphName } from '../../utils/icons';

type SlotName = 'details' | 'actions';

/**
 * One event of kern-timeline: a marker on the line, heading, point in time, description and optional details and
 * actions. The marker has a shape per tone like kern-status (ok = circle, warn = diamond, danger = square,
 * busy = pulsing circle, neutral = hollow circle), with `icon` inside. Colour and shape are decoration: the heading
 * or the `status` word says what happened.
 *
 * `collapsible` hides the `details` slot behind a «Show details» button (`aria-expanded`, Enter/Space).
 *
 * @slot - Description: one or two sentences
 * @slot details - Longer details, e.g. a kern-kv or a changelog
 * @slot actions - Buttons or links, e.g. «Open update log»
 * @part marker - The marker on the line
 * @part heading - The heading
 * @part day - The day heading above the first event of a day (with `group-by="day"` on kern-timeline)
 * @part details - The details area
 */
@Component({
  tag: 'kern-timeline-item',
  styleUrl: 'kern-timeline-item.css',
  shadow: true,
})
export class KernTimelineItem {
  @Element() el!: HTMLElement;

  /** What happened, e.g. «Firmware updated». */
  @Prop() heading?: string;
  /** When: ISO 8601 point in time, epoch milliseconds or a Date. Shown with kern-date or, in day groups, kern-time. */
  @Prop() datetime?: string | number | Date;
  /** Shows the point in time relative to now («3 hours ago»); the absolute value is the tooltip. */
  @Prop() relative = false;
  /** Shape and colour of the marker, as in kern-status. */
  @Prop({ reflect: true }) tone: 'neutral' | 'ok' | 'warn' | 'danger' | 'busy' = 'neutral';
  /** Glyph in the marker (see kern-icon). */
  @Prop() icon?: GlyphName;
  /** State as a word beside the heading (a kern-status with `tone`), e.g. «Offline». */
  @Prop() status?: string;
  /** Hides the `details` slot behind a button. */
  @Prop({ reflect: true }) collapsible = false;
  /** Whether collapsible details are shown. */
  @Prop({ mutable: true, reflect: true }) open = false;
  /** Text of the button that shows the details; defaults to the Kern text. */
  @Prop() labelShow?: string;
  /** Text of the button that hides the details; defaults to the Kern text. */
  @Prop() labelHide?: string;
  /**
   * Day heading, set by kern-timeline with `group-by="day"`.
   * @internal
   */
  @Prop() dayLabel?: string;
  /**
   * Inside a day group: shows the time only.
   * @internal
   */
  @Prop() grouped = false;
  /**
   * Last event of its day: no line down to the next day heading.
   * @internal
   */
  @Prop() dayEnd = false;
  private t = kernTexts(this, 'kern-timeline-item');

  /** After the user opened or closed the details. */
  @Event() kernToggle!: EventEmitter<{ open: boolean }>;

  @State() slots: Record<SlotName, boolean> = { details: false, actions: false };

  componentWillLoad() {
    const names = Array.from(this.el.children).map((c) => c.getAttribute('slot'));
    this.slots = { details: names.includes('details'), actions: names.includes('actions') };
  }

  @Watch('datetime')
  changed() {
    // Lets kern-timeline regroup the days.
    this.el.dispatchEvent(new CustomEvent('kern-timeline-item-change', { bubbles: true }));
  }

  private onSlot = (name: SlotName) => (e: Event) => {
    const has = (e.target as HTMLSlotElement).assignedElements().length > 0;
    if (has !== this.slots[name]) this.slots = { ...this.slots, [name]: has };
  };

  private onToggle = () => {
    this.open = !this.open;
    this.kernToggle.emit({ open: this.open });
  };

  private renderTime() {
    const v = this.datetime;
    if (v == null || v === '') return null;
    if (this.relative) return <kern-date value={v} relative />;
    if (this.grouped) return <kern-time value={v} />;
    return <kern-date value={v} time />;
  }

  render() {
    const { details, actions } = this.slots;
    const shown = details && (!this.collapsible || this.open);
    return (
      <Host role="listitem">
        {this.dayLabel && (
          <div class="day" part="day">
            {this.dayLabel}
          </div>
        )}
        <div class={{ entry: true, end: this.dayEnd }}>
          <span class={{ marker: true, icon: !!this.icon }} part="marker" aria-hidden="true">
            {this.icon && <Icon name={this.icon} />}
          </span>
          <div class="body">
            <div class="top">
              <span class="heading" part="heading">
                {this.heading}
              </span>
              {this.status && <kern-status tone={this.tone}>{this.status}</kern-status>}
              <span class="time">{this.renderTime()}</span>
            </div>
            <div class="description">
              <slot />
            </div>
            {details && this.collapsible && (
              <button class="toggle" type="button" aria-expanded={this.open ? 'true' : 'false'} aria-controls="details" onClick={this.onToggle}>
                <Icon name="chevron-down" class="chevron" />
                {this.open ? this.t('labelHide') : this.t('labelShow')}
              </button>
            )}
            <div class="details" id="details" part="details" hidden={!shown}>
              <slot name="details" onSlotchange={this.onSlot('details')} />
            </div>
            <div class="actions" hidden={!actions}>
              <slot name="actions" onSlotchange={this.onSlot('actions')} />
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
