# Own header

With your own header in the `topbar` slot, open the drawer with `toggleSidebar()`; `kernSidebarToggle` reports `{ open }`, e.g. for `aria-expanded` on your button.

```html
<kern-app-shell breakpoint="10000" style="min-height:300px">
  <header slot="topbar" style="display:flex;align-items:center;gap:8px;height:48px;padding:0 16px;border-bottom:1px solid var(--line);background:var(--surface)">
    <kern-button class="open" size="sm" variant="ghost" aria-expanded="false">Menu</kern-button>
    <strong>Werkstatt</strong>
  </header>
  <nav slot="sidebar" style="display:grid;gap:8px">
    <kern-link href="#">Orders</kern-link>
    <kern-link href="#">Stock</kern-link>
  </nav>
  <p style="margin:0">The side navigation is always a drawer here (<code>breakpoint="10000"</code>).</p>
</kern-app-shell>
```

```js
const shell = root.querySelector('kern-app-shell');
const button = root.querySelector('.open');
button.addEventListener('click', () => shell.toggleSidebar());
shell.addEventListener('kernSidebarToggle', (e) => button.setAttribute('aria-expanded', String(e.detail.open)));
root.addEventListener('kernNavigate', (e) => e.preventDefault()); // demo only
```
