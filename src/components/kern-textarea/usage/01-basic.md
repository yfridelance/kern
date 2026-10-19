# Notes and scripts

A multi-line field with `rows`, `maxlength` and `hint`. `mono` suits scripts and configuration snippets.

```html
<div style="display:grid;gap:16px;max-width:480px">
  <kern-textarea label="Notes" placeholder="Where is the device mounted?" maxlength="500" hint="Up to 500 characters"></kern-textarea>
  <kern-textarea label="Script" rows="6" mono value="Shelly.call('Switch.Set', { id: 0, on: true });"></kern-textarea>
</div>
```
