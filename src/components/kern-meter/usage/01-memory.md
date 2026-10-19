# Memory and storage

`kern-meter` shows a fill level against `max`. The colour switches from ok to warn at `warn` percent (default 75) and to danger at `danger` percent (default 90).

```html
<div style="display:grid;gap:12px;max-width:320px">
  <kern-meter label="RAM" value="42"></kern-meter>
  <kern-meter label="Flash" value="81"></kern-meter>
  <kern-meter label="Script memory" value="23" max="25" unit="kB"></kern-meter>
</div>
```
