# Tones

Badges label properties and results in at most two words. `tone` colours them; `neutral` is the default for plain properties such as the device generation. Device states belong in kern-status.

```html
<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
  <kern-badge>Gen2</kern-badge>
  <kern-badge tone="accent">Template</kern-badge>
  <kern-badge tone="ok">connected</kern-badge>
  <kern-badge tone="warn">Update</kern-badge>
  <kern-badge tone="danger">Auth failed</kern-badge>
</div>
```
