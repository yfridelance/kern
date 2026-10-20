import { Component, Element, Event, EventEmitter, Host, Method, Prop, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { kernTexts } from '../../utils/i18n';

const GLYPH = { neutral: 'i', info: 'i', ok: '✓', warn: '!', danger: '×' } as const;

export type KernToastReason = 'timeout' | 'close' | 'action';

/**
 * Short, non-blocking feedback after an action („Snapshot gespeichert“). Usually created with `toast()`, which stacks
 * them at the bottom right. Closes itself after `duration` (paused while hovered or focused), with the × or the
 * optional action. `toast()` announces it through a polite live region; `danger` interrupts as an alert.
 *
 * @slot - Message text
 * @part action - The action button
 */
@Component({
  tag: 'kern-toast',
  styleUrl: 'kern-toast.css',
  shadow: true,
})
export class KernToast {
  @Element() el!: HTMLElement;

  @Prop({ reflect: true }) tone: 'neutral' | 'info' | 'ok' | 'warn' | 'danger' = 'neutral';
  @Prop() heading?: string;
  /** Text of an optional action, e.g. „Rückgängig“. */
  @Prop() actionLabel?: string;
  /** Milliseconds until it closes itself; 0 keeps it until closed. */
  @Prop() duration = 5000;
  @Prop() closeLabel?: string;
  private t = kernTexts(this, 'kern-toast');

  /** The action was clicked (the toast then closes). */
  @Event() kernAction!: EventEmitter<void>;
  /** The toast closed; `reason` says why. */
  @Event() kernClose!: EventEmitter<{ reason: KernToastReason }>;

  private timer?: ReturnType<typeof setTimeout>;
  private remaining = 0;
  private startedAt = 0;
  private closed = false;
  private paused = 0;

  componentDidLoad() {
    this.remaining = this.duration;
    this.resume();
  }

  disconnectedCallback() {
    clearTimeout(this.timer);
  }

  /** Closes the toast. */
  @Method()
  async close(reason: KernToastReason = 'close') {
    if (this.closed) return;
    this.closed = true;
    clearTimeout(this.timer);
    this.kernClose.emit({ reason });
  }

  private resume() {
    if (!this.duration || this.closed) return;
    clearTimeout(this.timer);
    this.startedAt = Date.now();
    this.timer = setTimeout(() => this.close('timeout'), this.remaining);
  }

  /** Hover and focus each hold the timer; it runs again when both are gone. */
  private hold = () => {
    if (this.paused++ === 0 && this.duration) {
      clearTimeout(this.timer);
      this.remaining = Math.max(0, this.remaining - (Date.now() - this.startedAt));
    }
  };

  private release = () => {
    this.paused = Math.max(0, this.paused - 1);
    if (this.paused === 0) this.resume();
  };

  private onAction = () => {
    this.kernAction.emit();
    this.close('action');
  };

  render() {
    return (
      <Host
        // toast() puts it into a polite live region; only errors interrupt as an alert.
        role={this.tone === 'danger' ? 'alert' : undefined}
        onMouseEnter={this.hold}
        onMouseLeave={this.release}
        onFocusin={this.hold}
        onFocusout={this.release}
      >
        <span class="icon" aria-hidden="true">
          {GLYPH[this.tone] ?? 'i'}
        </span>
        <div class="content">
          {this.heading && <div class="heading">{this.heading}</div>}
          <div class="body">
            <slot />
          </div>
        </div>
        {this.actionLabel && (
          <button type="button" class="action" part="action" onClick={this.onAction}>
            {this.actionLabel}
          </button>
        )}
        <button type="button" class="close" aria-label={this.t('closeLabel')} title={this.t('closeLabel')} onClick={() => this.close('close')}>
          <Icon name="close" />
        </button>
      </Host>
    );
  }
}
