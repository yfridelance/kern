import { AttachInternals, Component, Host, Prop, h } from '@stencil/core';

/**
 * Button for actions. One `primary` per area; `danger` for destructive actions; `icon-only` needs `label`.
 * Works as a form submit/reset button through ElementInternals.
 *
 * @slot - Button text
 * @slot start - Icon before the text
 * @part control - The native button or link
 */
@Component({
  tag: 'kern-button',
  styleUrl: 'kern-button.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernButton {
  @AttachInternals() internals!: ElementInternals;

  /** Visual weight. */
  @Prop({ reflect: true }) variant: 'default' | 'primary' | 'ghost' | 'danger' = 'default';
  /** `sm` = 28px for tables and toolbars. */
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  /** Square button that shows only the `start` slot or default slot icon. Requires `label`. */
  @Prop({ reflect: true }) iconOnly = false;
  /** Accessible name (required for icon-only buttons). */
  @Prop() label?: string;
  @Prop({ reflect: true }) disabled = false;
  /** Shows a spinner and sets aria-busy; clicks are ignored. */
  @Prop({ reflect: true }) busy = false;
  @Prop() type: 'button' | 'submit' | 'reset' = 'button';
  /** Renders a link instead of a button. */
  @Prop() href?: string;
  @Prop() target?: string;
  /** With `href`: download instead of navigate (optionally with this file name). */
  @Prop() download?: string | boolean;

  private onClick = (ev: MouseEvent) => {
    if (this.disabled || this.busy) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      return;
    }
    const form = this.internals?.form;
    if (!form || this.href) return;
    if (this.type === 'submit') form.requestSubmit();
    if (this.type === 'reset') form.reset();
  };

  render() {
    const inner = [
      this.busy ? <span class="spinner" aria-hidden="true" /> : <slot name="start" />,
      <span class="label">
        <slot />
      </span>,
    ];
    const common = {
      class: 'control',
      part: 'control',
      'aria-label': this.label,
      title: this.iconOnly ? this.label : undefined,
      onClick: this.onClick,
    };
    return (
      <Host>
        {this.href && !this.disabled ? (
          <a
            {...common}
            href={this.href}
            target={this.target}
            rel={this.target === '_blank' ? 'noopener' : undefined}
            download={this.download === true || this.download === '' ? '' : this.download || undefined}
          >
            {inner}
          </a>
        ) : (
          <button {...common} type="button" disabled={this.disabled} aria-busy={this.busy ? 'true' : undefined}>
            {inner}
          </button>
        )}
      </Host>
    );
  }
}
