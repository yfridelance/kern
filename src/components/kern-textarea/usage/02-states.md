# Error, read-only and disabled

`error` marks the field invalid; `required` blocks an empty form submission.

```html
<div style="display:grid;gap:16px;max-width:480px">
  <kern-textarea label="Reason for factory reset" required rows="3" error="Please give a reason"></kern-textarea>
  <kern-textarea label="Last log line" rows="2" mono readonly value="[12:04:31] wifi: connected to Home (-61 dBm)"></kern-textarea>
  <kern-textarea label="Comment" rows="2" disabled value="Locked while the update runs"></kern-textarea>
</div>
```
