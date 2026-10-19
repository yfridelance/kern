# kern-sparkline



<!-- Auto Generated Below -->


## Overview

Mini trend line without axes for tiles and table cells. Fills the container width; 32px high.

## Usage

### 01-trend

# Trend line

A mini line without axes that fills its container's width (32px high). `values` takes an array, a JSON array or a comma-separated string; `fill` adds a light area, `tone` picks the colour, and `label` is the accessible name.

```html
<div style="display:grid;gap:16px;max-width:320px">
  <kern-sparkline values="820,900,880,1010,1200,1150,1284" fill label="Power, last 7 hours"></kern-sparkline>
  <kern-sparkline values="21.5,21.2,20.8,20.4,20.9,21.6,22.1" tone="chart-3" label="Temperature"></kern-sparkline>
  <kern-sparkline values="-58,-61,-66,-72,-79,-83,-86" tone="danger" label="Wi-Fi signal dropping"></kern-sparkline>
</div>
```


### 02-scale

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



## Properties

| Property | Attribute | Description                                             | Type                                                                             | Default     |
| -------- | --------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------- |
| `fill`   | `fill`    | Light area under the line.                              | `boolean`                                                                        | `false`     |
| `label`  | `label`   |                                                         | `string`                                                                         | `'Verlauf'` |
| `max`    | `max`     |                                                         | `number \| undefined`                                                            | `undefined` |
| `min`    | `min`     |                                                         | `number \| undefined`                                                            | `undefined` |
| `tone`   | `tone`    |                                                         | `"chart-1" \| "chart-2" \| "chart-3" \| "chart-4" \| "danger" \| "ok" \| "warn"` | `'chart-1'` |
| `values` | `values`  | Numbers as array, JSON array or comma-separated string. | `number[] \| string`                                                             | `[]`        |


----------------------------------------------


