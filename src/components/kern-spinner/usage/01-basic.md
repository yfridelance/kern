# Short waits

For waits under a few seconds. The spinner takes the current text colour; `size` sets the diameter in px. Without `label` it is decorative — give it one when nothing else tells screen readers that something is loading.

```html
<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center">
  <kern-spinner></kern-spinner>
  <kern-spinner size="20" label="Loading devices"></kern-spinner>
  <span style="display:flex;gap:8px;align-items:center;color:var(--text-muted)"><kern-spinner></kern-spinner>Querying 192.168.1.21 …</span>
</div>
```
