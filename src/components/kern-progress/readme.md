# kern-progress



<!-- Auto Generated Below -->


## Overview

Progress of a long operation. With `value` it shows the share of `max` (scan, template on N devices);
without `value` it runs as an indeterminate band (firmware update, reboot).

## Properties

| Property    | Attribute    | Description                                        | Type                  | Default     |
| ----------- | ------------ | -------------------------------------------------- | --------------------- | ----------- |
| `label`     | `label`      | Text on the left above the bar.                    | `string \| undefined` | `undefined` |
| `max`       | `max`        |                                                    | `number`              | `100`       |
| `value`     | `value`      |                                                    | `number \| undefined` | `undefined` |
| `valueText` | `value-text` | Text on the right above the bar, e.g. "148 / 254". | `string \| undefined` | `undefined` |


## Shadow Parts

| Part    | Description     |
| ------- | --------------- |
| `"bar"` | The filled part |


----------------------------------------------


