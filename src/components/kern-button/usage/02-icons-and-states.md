# Icons, busy and disabled

Put a kern-icon into the `start` slot before the text. `icon-only` shows just the icon and needs `label` as its accessible name. `busy` shows a spinner, sets `aria-busy` and ignores clicks; `disabled` turns the button off.

```html
<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
  <kern-button><kern-icon slot="start" name="refresh"></kern-icon>Refresh status</kern-button>
  <kern-button variant="ghost" icon-only label="Restart Bad Lüftung"><kern-icon name="power"></kern-icon></kern-button>
  <kern-button size="sm" variant="ghost" icon-only label="Edit"><kern-icon name="edit"></kern-icon></kern-button>
  <kern-button variant="primary" busy>Scanning …</kern-button>
  <kern-button disabled>Disabled</kern-button>
</div>
```
