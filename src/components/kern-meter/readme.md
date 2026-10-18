# kern-meter



<!-- Auto Generated Below -->


## Overview

Fill level with thresholds (RAM, flash, temperature, load). Colour goes ok → warn → danger;
`neutral` uses the accent for amounts without good/bad.

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


