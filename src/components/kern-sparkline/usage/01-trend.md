# Trend line

A mini line without axes that fills its container's width (32px high). `values` takes an array, a JSON array or a comma-separated string; `fill` adds a light area, `tone` picks the colour, and `label` is the accessible name.

```html
<div style="display:grid;gap:16px;max-width:320px">
  <kern-sparkline values="820,900,880,1010,1200,1150,1284" fill label="Power, last 7 hours"></kern-sparkline>
  <kern-sparkline values="21.5,21.2,20.8,20.4,20.9,21.6,22.1" tone="chart-3" label="Temperature"></kern-sparkline>
  <kern-sparkline values="-58,-61,-66,-72,-79,-83,-86" tone="danger" label="Wi-Fi signal dropping"></kern-sparkline>
</div>
```
