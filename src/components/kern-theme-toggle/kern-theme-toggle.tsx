import { Component, Host, Prop, State, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { getTheme, setTheme, type KernTheme } from '../../utils/theme';

/**
 * Icon button switching between dark (default) and light; remembers the choice (localStorage `kern-theme`).
 * The icon shows the current theme (moon = dark). Set the theme before first paint with `initTheme()`
 * or the inline snippet from the README.
 */
@Component({
  tag: 'kern-theme-toggle',
  styleUrl: 'kern-theme-toggle.css',
  shadow: true,
})
export class KernThemeToggle {
  /** 28px instead of 34px. */
  @Prop() small = false;
  /** Accessible label while dark. */
  @Prop() labelLight = 'Zu hellem Design wechseln';
  /** Accessible label while light. */
  @Prop() labelDark = 'Zu dunklem Design wechseln';

  @State() theme: KernTheme = 'dark';

  private observer?: MutationObserver;

  connectedCallback() {
    this.theme = getTheme();
    if (typeof MutationObserver === 'undefined') return; // server-side / test DOM
    this.observer = new MutationObserver(() => (this.theme = getTheme()));
    this.observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  render() {
    const dark = this.theme === 'dark';
    return (
      <Host>
        <kern-button variant="ghost" size={this.small ? 'sm' : 'md'} icon-only label={dark ? this.labelLight : this.labelDark} onClick={() => setTheme(dark ? 'light' : 'dark')}>
          <Icon name={dark ? 'moon' : 'sun'} />
        </kern-button>
      </Host>
    );
  }
}
