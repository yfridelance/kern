# Inside a card, empty

`flush` drops the list's own border and background, e.g. inside `kern-card`; `size="sm"` gives denser rows. Without items the list shows the `empty` text.

```html
<div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
  <kern-card heading="Events" flush>
    <kern-list flush size="sm" label="Events">
      <kern-list-item heading="Bathroom fan switched on" meta="09:41"></kern-list-item>
      <kern-list-item heading="Snapshot saved" meta="09:12"></kern-list-item>
      <kern-list-item heading="Kitchen light rebooted" meta="08:03"></kern-list-item>
    </kern-list>
  </kern-card>
  <kern-card heading="Notifications" flush>
    <kern-list flush size="sm" empty="No notifications"></kern-list>
  </kern-card>
</div>
```
