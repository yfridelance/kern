# Device states

A dot plus the state as a word. Each tone has its own shape as well as colour, so the state does not depend on colour alone: `ok` circle, `warn` diamond, `danger` square, `busy` pulsing circle, `neutral` hollow circle.

```html
<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center">
  <kern-status tone="ok">Active</kern-status>
  <kern-status tone="warn">Missing</kern-status>
  <kern-status tone="danger">Offline</kern-status>
  <kern-status tone="busy">Scanning</kern-status>
  <kern-status>Reset</kern-status>
</div>
```
