import { Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { kernTexts } from '../../utils/i18n';
import { focusAutofocus } from '../../utils/autofocus';

/**
 * Modal dialog for confirmations and short forms, on the native `<dialog>`.
 * Destructive: the heading names action and device, a `kern-alert tone="warn"` states the consequence,
 * the confirm button is `variant="danger"` with a verb.
 *
 * @slot - Body
 * @slot footer - Buttons, right-aligned: cancel first, confirm last
 * @part panel - The dialog surface
 */
@Component({
  tag: 'kern-dialog',
  styleUrl: 'kern-dialog.css',
  shadow: true,
})
export class KernDialog {
  @Element() el!: HTMLElement;

  @Prop({ mutable: true, reflect: true }) open = false;
  @Prop() heading?: string;
  /** Accessible name of the dialog when it has no visible `heading`. */
  @Prop() label?: string;
  /** Shows the close button and allows Escape. */
  @Prop() dismissible = true;
  /** Accessible label of the close button. */
  @Prop() closeLabel?: string;
  private t = kernTexts(this, 'kern-dialog');
  /** Panel width in px. */
  @Prop() width = 520;

  /**
   * After the dialog opened (`show()` or `open`). The focus moves to the first Kern field with `autofocus` once it is
   * ready, otherwise it stays on the first focusable element (the close button); without `autofocus` the app can set it here.
   */
  @Event() kernOpen!: EventEmitter<void>;
  /** After the dialog closed (Escape, close button or `close()`); `detail.returnValue` as given to `close()`. */
  @Event() kernClose!: EventEmitter<{ returnValue: string }>;

  @State() hasFooter = false;

  private dialog?: HTMLDialogElement;
  private returnValue = '';

  componentWillLoad() {
    this.hasFooter = Array.from(this.el.children).some((c) => c.getAttribute('slot') === 'footer');
  }

  componentDidLoad() {
    this.apply();
  }

  @Watch('open')
  apply() {
    const d = this.dialog;
    if (!d) return;
    if (this.open && !d.open) {
      this.returnValue = '';
      d.showModal();
      this.kernOpen.emit();
      focusAutofocus(this.el, () => !!this.dialog?.open);
    }
    if (!this.open && d.open) d.close(this.returnValue);
  }

  /** Opens the dialog modally. */
  @Method()
  async show() {
    this.open = true;
  }

  /** Closes the dialog; `returnValue` is passed to `kernClose`. */
  @Method()
  async close(returnValue = '') {
    this.returnValue = returnValue;
    this.open = false;
  }

  private onCancel = (ev: Event) => {
    if (!this.dismissible) ev.preventDefault();
  };

  private onNativeClose = () => {
    // The close event comes a task later: when the dialog was reopened in between, it belongs to the old session.
    if (this.dialog?.open) return;
    this.open = false;
    this.kernClose.emit({ returnValue: this.returnValue });
  };

  render() {
    return (
      <Host>
        <dialog
          ref={(el) => (this.dialog = el)}
          part="panel"
          aria-label={this.heading ?? this.label}
          style={{ width: `min(${this.width}px, calc(100vw - 32px))` }}
          onCancel={this.onCancel}
          onClose={this.onNativeClose}
        >
          {(this.heading || this.dismissible) && (
            <header>
              {this.heading && <h2>{this.heading}</h2>}
              {this.dismissible && (
                <kern-button variant="ghost" size="sm" icon-only label={this.t('closeLabel')} onClick={() => this.close('cancel')}>
                  <Icon name="close" />
                </kern-button>
              )}
            </header>
          )}
          <div class="body">
            <slot />
          </div>
          <footer hidden={!this.hasFooter}>
            <slot name="footer" onSlotchange={(e) => (this.hasFooter = (e.target as HTMLSlotElement).assignedElements().length > 0)} />
          </footer>
        </dialog>
      </Host>
    );
  }
}
