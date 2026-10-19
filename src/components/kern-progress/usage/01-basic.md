# Determinate and indeterminate

With `value` the bar shows the share of `max`; `label` sits on the left and `value-text` on the right above the bar. Without `value` it runs as an indeterminate band for operations of unknown length.

```html
<div style="display:grid;gap:16px;max-width:480px">
  <kern-progress label="Scan 192.168.1.0/24" value="148" max="254" value-text="148 / 254"></kern-progress>
  <kern-progress label="Template on 6 devices" value="50" value-text="3 of 6"></kern-progress>
  <kern-progress label="Installing firmware …"></kern-progress>
</div>
```
