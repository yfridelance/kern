# Key figures

`kern-stat` shows a label, a large `value` with `unit`, and optionally a `delta` with `trend` plus `meta` text. Group tiles in a grid with `repeat(auto-fit, minmax(180px, 1fr))`.

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
  <kern-stat label="Devices online" value="36" unit="/ 38" delta="2" trend="down" meta="missing"></kern-stat>
  <kern-stat label="Updates" value="3" meta="available · Stable"></kern-stat>
  <kern-stat label="Errors (24 h)" value="5" delta="+3" trend="up" invert></kern-stat>
</div>
```
