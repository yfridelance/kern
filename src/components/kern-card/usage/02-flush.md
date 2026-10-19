# Flush body and heading level

`flush` removes the body padding so lists and tables reach the edge. `heading-level` sets the heading element (2–4) to fit the document outline.

```html
<kern-card heading="Events" heading-level="3" flush style="max-width:420px">
  <kern-list flush size="sm" label="Events">
    <kern-list-item heading="Bad Lüftung" description="Snapshot saved">
      <kern-status slot="start" tone="ok"></kern-status>
    </kern-list-item>
    <kern-list-item heading="Rollladen Süd" description="Not reachable since yesterday">
      <kern-status slot="start" tone="warn"></kern-status>
    </kern-list-item>
  </kern-list>
</kern-card>
```
