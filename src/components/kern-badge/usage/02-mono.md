# Versions and IDs

`mono` sets the text in monospace for firmware versions, IDs and similar values. Badges sit well next to a name in a table cell.

```html
<p style="margin:0;display:flex;flex-wrap:wrap;gap:8px;align-items:center">
  Küche Licht <kern-badge tone="warn">Update</kern-badge>
  <kern-badge mono>1.4.4</kern-badge>
  <kern-badge mono tone="accent">1.5.0-beta2</kern-badge>
</p>
```
