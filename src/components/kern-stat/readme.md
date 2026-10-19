# kern-stat



<!-- Auto Generated Below -->


## Overview

Key figure tile: label, large value with unit, optional change and a slot for a sparkline or meta text.
Group tiles in a grid (`repeat(auto-fit, minmax(180px, 1fr))`).

## Usage

### 01-tiles

# Key figures

`kern-stat` shows a label, a large `value` with `unit`, and optionally a `delta` with `trend` plus `meta` text. Group tiles in a grid with `repeat(auto-fit, minmax(180px, 1fr))`.

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
  <kern-stat label="Devices online" value="36" unit="/ 38" delta="2" trend="down" meta="missing"></kern-stat>
  <kern-stat label="Updates" value="3" meta="available · Stable"></kern-stat>
  <kern-stat label="Errors (24 h)" value="5" delta="+3" trend="up" invert></kern-stat>
</div>
```


### 02-sparkline

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



## Properties

| Property             | Attribute | Description                                                           | Type                          | Default     |
| -------------------- | --------- | --------------------------------------------------------------------- | ----------------------------- | ----------- |
| `delta`              | `delta`   | Change shown with an arrow, e.g. "2" or "+12 %".                      | `string \| undefined`         | `undefined` |
| `invert`             | `invert`  | When "more" is bad (errors, offline): up shows danger, down shows ok. | `boolean`                     | `false`     |
| `label` _(required)_ | `label`   |                                                                       | `string`                      | `undefined` |
| `meta`               | `meta`    | Text after the delta.                                                 | `string \| undefined`         | `undefined` |
| `trend`              | `trend`   | Direction of `delta`.                                                 | `"down" \| "up" \| undefined` | `undefined` |
| `unit`               | `unit`    |                                                                       | `string \| undefined`         | `undefined` |
| `value` _(required)_ | `value`   |                                                                       | `number \| string`            | `undefined` |


## Slots

| Slot | Description                                  |
| ---- | -------------------------------------------- |
|      | Below the value: kern-sparkline or meta text |


----------------------------------------------


