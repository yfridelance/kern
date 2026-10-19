# With a sparkline

The default slot sits below the value, typically a `kern-sparkline` showing the recent trend.

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
  <kern-stat label="Power" value="1’284" unit="W" delta="+12 %" trend="up">
    <kern-sparkline values="820,900,880,1010,1200,1150,1284" fill label="Power, last 7 hours"></kern-sparkline>
  </kern-stat>
  <kern-stat label="Energy today" value="9.4" unit="kWh">
    <kern-sparkline values="0.2,0.4,1.1,2.6,4.0,5.8,7.1,9.4" tone="chart-2" label="Energy today"></kern-sparkline>
  </kern-stat>
</div>
```
