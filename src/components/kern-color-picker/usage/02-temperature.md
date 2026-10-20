# Color temperature

`mode="temperature"`: `value` is a colour temperature in Kelvin between `min-kelvin` and `max-kelvin` on a warm-to-cold bar, in steps of `kelvin-step`. Swatches are Kelvin values.

```html
<div style="display:grid;gap:16px;max-width:280px">
  <kern-color-picker name="white" label="White tone" mode="temperature" value="3000" swatches="2700,3000,4000,5000,6500"></kern-color-picker>
  <kern-color-picker label="Desk lamp" mode="temperature" value="4000" min-kelvin="3000" max-kelvin="5000" kelvin-step="250" readonly></kern-color-picker>
</div>
```
