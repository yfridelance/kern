# Wi-Fi signal

Four bars plus the RSSI in dBm: ≥ −55 gives 4 bars, ≥ −67 3, ≥ −75 2, ≥ −85 1 (warn), below that 0 (danger). Set `label` for the accessible name.

```html
<div style="display:flex;flex-wrap:wrap;gap:24px">
  <kern-signal rssi="-52" label="Wi-Fi signal"></kern-signal>
  <kern-signal rssi="-63" label="Wi-Fi signal"></kern-signal>
  <kern-signal rssi="-71" label="Wi-Fi signal"></kern-signal>
  <kern-signal rssi="-82" label="Wi-Fi signal"></kern-signal>
  <kern-signal rssi="-91" label="Wi-Fi signal"></kern-signal>
  <kern-signal label="Wi-Fi signal"></kern-signal>
</div>
```
