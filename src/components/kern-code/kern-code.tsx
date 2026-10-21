import { Component, Element, Event, EventEmitter, Host, Method, Prop, State, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { dedent, tokenLines, type KernCodeLanguage } from '../../utils/highlight';
import { kernTexts } from '../../utils/i18n';

/**
 * Code and commands: a block with copy button, optional heading (file name), line numbers, wrapping and a maximum
 * height, highlighted for shell, PowerShell, yaml, json, js/ts, ini, html, Ruby and Go; or `inline` in running text. The code comes from `code`
 * or the text content; common indentation is removed, so it can be written indented in HTML.
 *
 * With `follow` and `max-height` it suits live logs: appended lines scroll into view while the block is scrolled to the
 * end; scroll up and the position stays, with a button to jump back to the latest line.
 *
 * @slot - The code as text (instead of `code`)
 * @part code - The `<pre>` (block) or `<code>` (inline)
 * @part copy - The copy button
 * @part latest - The «Jump to latest» button (with `follow`)
 */
@Component({
  tag: 'kern-code',
  styleUrl: 'kern-code.css',
  shadow: true,
})
export class KernCode {
  @Element() el!: HTMLElement;

  /** The code; defaults to the text content. */
  @Prop() code?: string;
  /**
   * Highlighting: `shell`, `powershell` (`ps1`, `pwsh`), `yaml`, `json`, `js`, `ts`, `ini`, `html`, `ruby` (`rb`),
   * `go` (`golang`) or `text`.
   */
  @Prop() language: KernCodeLanguage = 'text';
  /** Title above the block, e.g. a file name. */
  @Prop() heading?: string;
  @Prop() lineNumbers = false;
  /** Wrap long lines instead of scrolling sideways. */
  @Prop() wrap = false;
  /** Scroll beyond this height, e.g. `240px`. */
  @Prop() maxHeight?: string;
  /** In running text, without copy button. */
  @Prop({ reflect: true }) inline = false;
  /** Hide the copy button. */
  @Prop() noCopy = false;
  /**
   * Follow new lines, for live logs with `max-height`: when the code changes while the block is scrolled to the end,
   * it scrolls to the new end. Scrolled up, the position stays and a button jumps to the latest line.
   */
  @Prop() follow = false;
  @Prop() labelCopy?: string;
  @Prop() labelCopied?: string;
  @Prop() labelLatest?: string;
  private t = kernTexts(this, 'kern-code');

  /** After a successful copy. */
  @Event() kernCopy!: EventEmitter<{ value: string }>;

  @State() slotText = '';
  @State() copied = false;
  /** With `follow`: scrolled away from the end. */
  @State() away = false;

  private observer?: MutationObserver;
  private timer?: ReturnType<typeof setTimeout>;
  private pre?: HTMLPreElement;
  /** Whether the next render should end scrolled to the end (measured before it). */
  private stick = true;

  connectedCallback() {
    this.read();
    if (typeof MutationObserver === 'undefined') return; // server-side / test DOM
    this.observer = new MutationObserver(() => this.read());
    this.observer.observe(this.el, { childList: true, characterData: true, subtree: true });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    clearTimeout(this.timer);
  }

  /** Scroll the block to its last line. */
  @Method()
  async scrollToEnd() {
    if (this.pre) this.pre.scrollTop = this.pre.scrollHeight;
    this.away = false;
  }

  componentWillRender() {
    // Measured before the new lines are in: only a block that was at the end follows them.
    this.stick = !this.pre || this.atEnd();
  }

  componentDidRender() {
    if (!this.follow || !this.pre) return;
    // Synchronously after the patch and before the next paint, so fast updates don't flicker.
    if (this.stick) this.pre.scrollTop = this.pre.scrollHeight;
    const away = !this.atEnd();
    if (away !== this.away) this.away = away;
  }

  private atEnd() {
    const pre = this.pre!;
    return !(pre.scrollHeight > pre.clientHeight) || pre.scrollTop + pre.clientHeight >= pre.scrollHeight - 4;
  }

  /** The button removes itself; focus moves to the log first, so keyboard use continues there. */
  private jumpToLatest = () => {
    this.pre?.focus({ preventScroll: true });
    this.scrollToEnd();
  };

  private onScroll = () => {
    if (!this.follow) return;
    const away = !this.atEnd();
    if (away !== this.away) this.away = away;
  };

  private read() {
    this.slotText = this.el.textContent ?? '';
  }

  private get text(): string {
    const raw = this.code ?? this.slotText;
    return this.inline ? raw.trim() : dedent(raw);
  }

  private copy = async () => {
    const value = this.text;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return; // clipboard blocked (no secure context)
    }
    this.copied = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => (this.copied = false), 1200);
    this.kernCopy.emit({ value });
  };

  private renderLines() {
    return tokenLines(this.text, this.language).map((line) => (
      <span class="line">
        {line.length ? line.map((t) => (t.type ? <span class={t.type}>{t.text}</span> : t.text)) : '\n'}
      </span>
    ));
  }

  render() {
    if (this.inline) {
      return (
        <Host>
          <code part="code">{tokenLines(this.text, this.language)[0]?.map((t) => (t.type ? <span class={t.type}>{t.text}</span> : t.text))}</code>
          <span hidden>
            <slot />
          </span>
        </Host>
      );
    }
    return (
      <Host>
        {(this.heading || !this.noCopy) && (
          <div class={{ head: true, titled: !!this.heading }}>
            {this.heading && <span class="heading">{this.heading}</span>}
            {!this.noCopy && (
              <button type="button" class={{ copy: true, done: this.copied }} part="copy" aria-label={this.t('labelCopy')} title={this.copied ? this.t('labelCopied') : this.t('labelCopy')} onClick={this.copy}>
                <Icon name={this.copied ? 'check' : 'copy'} />
                <span class="copy-text" aria-live="polite">
                  {this.copied ? this.t('labelCopied') : ''}
                </span>
              </button>
            )}
          </div>
        )}
        <pre
          part="code"
          class={{ numbered: this.lineNumbers, wrap: this.wrap }}
          style={{ maxHeight: this.maxHeight }}
          tabindex={0}
          aria-label={this.heading}
          ref={(el) => (this.pre = el)}
          onScroll={this.onScroll}
        >
          <code>{this.renderLines()}</code>
        </pre>
        {this.follow && this.away && (
          <button type="button" class="latest" part="latest" onClick={this.jumpToLatest}>
            <Icon name="chevron-down" />
            {this.t('labelLatest')}
          </button>
        )}
        <span hidden>
          <slot />
        </span>
      </Host>
    );
  }
}
