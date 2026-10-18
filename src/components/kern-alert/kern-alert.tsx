import { Component, Host, Prop, h } from '@stencil/core';

const GLYPH = { neutral: 'i', info: 'i', ok: '✓', warn: '!', danger: '×' } as const;

/**
 * Message in the page flow: information, success, warning or error. One or two sentences;
 * `danger` is announced as an alert, the others as status.
 *
 * @slot - Message text
 * @part icon - The tone glyph
 */
@Component({
  tag: 'kern-alert',
  styleUrl: 'kern-alert.css',
  shadow: true,
})
export class KernAlert {
  @Prop({ reflect: true }) tone: 'neutral' | 'info' | 'ok' | 'warn' | 'danger' = 'neutral';
  /** Optional bold first line. */
  @Prop() heading?: string;

  render() {
    return (
      <Host role={this.tone === 'danger' ? 'alert' : 'status'}>
        <span class="icon" part="icon" aria-hidden="true">
          {GLYPH[this.tone] ?? 'i'}
        </span>
        <div class="content">
          {this.heading && <div class="heading">{this.heading}</div>}
          <div class="body">
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
