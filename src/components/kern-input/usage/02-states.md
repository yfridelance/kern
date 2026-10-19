# Error, disabled and read-only

`error` shows a message and marks the field invalid, so it also blocks form submission. `disabled` fields are skipped by the form; `readonly` fields are submitted but cannot be edited.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-input label="Device password" type="password" value="secret" error="Wrong credentials"></kern-input>
  <kern-input label="Firmware" value="1.4.2-gf2c8e7a" mono readonly></kern-input>
  <kern-input label="Cloud token" value="Managed by the cloud" disabled></kern-input>
  <kern-input label="Auto-off" type="number" value="15" min="0" max="120" step="5" hint="Minutes, 0–120"></kern-input>
</div>
```
