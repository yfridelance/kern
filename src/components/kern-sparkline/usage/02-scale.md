# Fixed scale

By default the line spans the lowest to the highest value. Set `min` and `max` to compare several lines on the same scale; here the lower load stays low instead of filling the height.

```html
<div style="display:grid;gap:16px;max-width:320px">
  <kern-sparkline values="12,18,15,22,30,26,24" min="0" max="100" fill tone="ok" label="CPU load, device A"></kern-sparkline>
  <kern-sparkline values="55,62,70,78,84,88,91" min="0" max="100" fill tone="warn" label="CPU load, device B"></kern-sparkline>
</div>
```

```js
// Values can also be set as an array property, e.g. when new readings arrive.
const live = root.querySelector('kern-sparkline');
const readings = [12, 18, 15, 22, 30, 26, 24];
setInterval(() => {
  readings.push(Math.round(10 + Math.random() * 25));
  readings.shift();
  live.values = [...readings];
}, 2000);
```
