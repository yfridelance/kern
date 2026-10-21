# Header on narrow cards

The header wraps when space runs out: heading and `meta` stay on the first line, the `actions` move below and stay right-aligned. Long headings break instead of pushing the buttons out of the card. Drag the corner of the frame to try it.

```html
<div style="resize:horizontal;overflow:hidden;width:300px;min-width:240px;max-width:100%">
  <kern-card heading="Firmware update on 12 devices">
    <kern-status slot="meta" tone="warn">Finished with errors</kern-status>
    <kern-button slot="actions" size="sm" variant="ghost">Log</kern-button>
    <kern-button slot="actions" size="sm">Retry failed</kern-button>
    <p style="margin:0">10 updated, 2 failed.</p>
  </kern-card>
</div>
```
