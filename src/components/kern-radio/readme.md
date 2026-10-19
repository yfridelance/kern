# kern-radio



<!-- Auto Generated Below -->


## Overview

One option of kern-radio-group: a round marker with label and optional description. The group sets `checked` and
the tab stop; use it only inside kern-radio-group.

## Properties

| Property      | Attribute     | Description              | Type                  | Default     |
| ------------- | ------------- | ------------------------ | --------------------- | ----------- |
| `checked`     | `checked`     | Set by kern-radio-group. | `boolean`             | `false`     |
| `description` | `description` |                          | `string \| undefined` | `undefined` |
| `disabled`    | `disabled`    |                          | `boolean`             | `false`     |
| `label`       | `label`       |                          | `string \| undefined` | `undefined` |
| `value`       | `value`       |                          | `string`              | `''`        |


## Events

| Event             | Description                                      | Type                              |
| ----------------- | ------------------------------------------------ | --------------------------------- |
| `kernRadioSelect` | Asks the group to select this option (internal). | `CustomEvent<{ value: string; }>` |


## Slots

| Slot            | Description                            |
| --------------- | -------------------------------------- |
|                 | Label (instead of `label`)             |
| `"description"` | Second line (instead of `description`) |


## Shadow Parts

| Part        | Description      |
| ----------- | ---------------- |
| `"control"` | The round marker |


----------------------------------------------


