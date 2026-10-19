# kern-meter



<!-- Auto Generated Below -->


## Overview

Fill level with thresholds (RAM, flash, temperature, load). Colour goes ok → warn → danger;
`neutral` uses the accent for amounts without good/bad.

## Usage

### 01-memory

# Memory and storage

`kern-meter` shows a fill level against `max`. The colour switches from ok to warn at `warn` percent (default 75) and to danger at `danger` percent (default 90).

```html
<div style="display:grid;gap:12px;max-width:320px">
  <kern-meter label="RAM" value="42"></kern-meter>
  <kern-meter label="Flash" value="81"></kern-meter>
  <kern-meter label="Script memory" value="23" max="25" unit="kB"></kern-meter>
</div>
```


### 02-thresholds

# Thresholds and units

Any `unit` other than `%` shows the raw value. Adjust `warn` and `danger` to your limits, or use `neutral` for amounts that are neither good nor bad.

```html
<div style="display:grid;gap:12px;max-width:320px">
  <kern-meter label="Device temperature" value="68" max="100" unit="°C" warn="60" danger="80"></kern-meter>
  <kern-meter label="Load" value="2900" max="3500" unit="W" warn="80" danger="95"></kern-meter>
  <kern-meter label="Energy today" value="9.4" max="20" unit="kWh" neutral></kern-meter>
</div>
```



## Properties

| Property  | Attribute | Description                                                     | Type                  | Default     |
| --------- | --------- | --------------------------------------------------------------- | --------------------- | ----------- |
| `danger`  | `danger`  | Threshold in percent of max.                                    | `number`              | `90`        |
| `label`   | `label`   |                                                                 | `string \| undefined` | `undefined` |
| `max`     | `max`     |                                                                 | `number`              | `100`       |
| `neutral` | `neutral` |                                                                 | `boolean`             | `false`     |
| `unit`    | `unit`    | `%` shows the share of max; any other unit shows the raw value. | `string`              | `'%'`       |
| `value`   | `value`   |                                                                 | `number`              | `0`         |
| `warn`    | `warn`    | Threshold in percent of max.                                    | `number`              | `75`        |


----------------------------------------------


