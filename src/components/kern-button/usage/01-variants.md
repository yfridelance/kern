# Variants and sizes

`variant` sets the visual weight: one `primary` per area, `ghost` for quiet actions, `danger` for destructive ones. `size="sm"` (28px) fits tables and toolbars.

```html
<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
  <kern-button variant="primary">Start scan</kern-button>
  <kern-button>Export CSV</kern-button>
  <kern-button variant="ghost">Snapshot</kern-button>
  <kern-button variant="danger">Factory reset …</kern-button>
  <kern-button size="sm">Update</kern-button>
  <kern-button size="sm" variant="ghost">Search again</kern-button>
</div>
```
