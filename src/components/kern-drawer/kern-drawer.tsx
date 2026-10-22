import { Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { kernTexts } from '../../utils/i18n';
import { focusAutofocus } from '../../utils/autofocus';

/**
 * Side panel over the page for details, filters and longer forms, on the native modal `<dialog>` (focus stays inside
 * and returns to the opener). Full height; header and footer stay put while the body scrolls. Escape, the close
 * button and a click on the backdrop close it unless `dismissible` is false. For short confirmations use kern-dialog.
 *
 * @slot - Body
 * @slot footer - Buttons, right-aligned: cancel first, confirm last
 * @part panel - The panel surface
 */
@Component({
  tag: 'kern-drawer',
  styleUrl: 'kern-drawer.css',
  shadow: true,
})
export class KernDrawer {
  @Element() el!: HTMLElement;

  @Prop({ mutable: true, reflect: true }) open = false;
  @Prop() heading?: string;
  /** Edge the panel slides in from (`end` = right in left-to-right layouts). */
  @Prop({ reflect: true }) side: 'end' | 'start' = 'end';
  /** Panel width in px (at most the viewport minus 32px). */
  @Prop() width = 420;
  /** Close button, Escape and backdrop click close the panel. */
  @Prop() dismissible = true;
  /** Accessible label of the close button. */
  @Prop() closeLabel?: string;
  private t = kernTexts(this, 'kern-drawer');

  /**
   * After the panel opened (`show()` or `open`). The focus moves to the first Kern field with `autofocus` once it is
   * ready, otherwise it stays on the first focusable element (the close button); without `autofocus` the app can set it here.
   */
  @Event() kernOpen!: EventEmitter<void>;
  /** After the panel closed; `detail.returnValue` as given to `close()` (`cancel` for Escape/backdrop/close button). */
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
      d.showModal?.();
      this.kernOpen.emit();
      focusAutofocus(this.el, () => !!this.dialog?.open);
    }
    if (!this.open && d.open) d.close(this.returnValue);
  }

  /** Opens the panel modally. */
  @Method()
  async show() {
    this.open = true;
  }

  /** Closes the panel; `returnValue` is passed to `kernClose`. */
  @Method()
  async close(returnValue = '') {
    this.returnValue = returnValue;
    this.open = false;
  }

  private onCancel = (ev: Event) => {
    if (!this.dismissible) ev.preventDefault();
    else this.returnValue = 'cancel';
  };

  /** The panel fills the dialog, so a click whose target is the dialog itself hit the backdrop. */
  private onClick = (ev: MouseEvent) => {
    if (this.dismissible && ev.target === this.dialog) this.close('cancel');
  };

  private onNativeClose = () => {
    this.open = false;
    this.kernClose.emit({ returnValue: this.returnValue });
  };

  render() {
    return (
      <Host>
        <dialog
          ref={(el) => (this.dialog = el)}
          aria-label={this.heading}
          style={{ width: `min(${this.width}px, calc(100vw - 32px))` }}
          onCancel={this.onCancel}
          onClose={this.onNativeClose}
          onClick={this.onClick}
        >
          <div class="panel" part="panel">
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
          </div>
        </dialog>
      </Host>
    );
  }
}
