# Dark and light theme

The button switches between dark (default) and light and remembers the choice in localStorage (`kern-theme`). `small` makes it 28px for the topbar. Its accessible label describes the action; set English texts with `label-light` and `label-dark`.

```html
<div style="display:flex;gap:12px;align-items:center">
  <kern-theme-toggle label-light="Switch to light theme" label-dark="Switch to dark theme"></kern-theme-toggle>
  <kern-theme-toggle small label-light="Switch to light theme" label-dark="Switch to dark theme"></kern-theme-toggle>
</div>
```
