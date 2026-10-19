# Thresholds and units

Any `unit` other than `%` shows the raw value. Adjust `warn` and `danger` to your limits, or use `neutral` for amounts that are neither good nor bad.

```html
<div style="display:grid;gap:12px;max-width:320px">
  <kern-meter label="Device temperature" value="68" max="100" unit="°C" warn="60" danger="80"></kern-meter>
  <kern-meter label="Load" value="2900" max="3500" unit="W" warn="80" danger="95"></kern-meter>
  <kern-meter label="Energy today" value="9.4" max="20" unit="kWh" neutral></kern-meter>
</div>
```
