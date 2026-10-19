import { Component, Element, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { dedent, tokenLines, type KernCodeLanguage } from '../../utils/highlight';

/**
 * Code and commands: a block with copy button, optional heading (file name), line numbers, wrapping and a maximum
 * height, highlighted for shell, yaml, json, js/ts and ini; or `inline` in running text. The code comes from `code`
 * or the text content; common indentation is removed, so it can be written indented in HTML.
 *
 * @slot - The code as text (instead of `code`)
 * @part code - The `<pre>` (block) or `<code>` (inline)
 * @part copy - The copy button
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
  @Prop() labelCopy = 'Kopieren';
  @Prop() labelCopied = 'Kopiert';

  /** After a successful copy. */
  @Event() kernCopy!: EventEmitter<{ value: string }>;

  @State() slotText = '';
  @State() copied = false;

  private observer?: MutationObserver;
  private timer?: ReturnType<typeof setTimeout>;

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
              <button type="button" class={{ copy: true, done: this.copied }} part="copy" aria-label={this.labelCopy} title={this.copied ? this.labelCopied : this.labelCopy} onClick={this.copy}>
                <Icon name={this.copied ? 'check' : 'copy'} />
                <span class="copy-text" aria-live="polite">
                  {this.copied ? this.labelCopied : ''}
                </span>
              </button>
            )}
          </div>
        )}
        <pre part="code" class={{ numbered: this.lineNumbers, wrap: this.wrap }} style={{ maxHeight: this.maxHeight }} tabindex={0} aria-label={this.heading}>
          <code>{this.renderLines()}</code>
        </pre>
        <span hidden>
          <slot />
        </span>
      </Host>
    );
  }
}
