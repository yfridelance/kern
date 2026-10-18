# kern-segmented



<!-- Auto Generated Below -->


## Overview

Compact single choice for 2–5 short options (filters, Stable/Beta, DHCP/Statisch), form-associated.
Options from the `options` property or child `<option>` elements. Arrow keys move the selection.

## Properties

| Property   | Attribute  | Description                   | Type                        | Default     |
| ---------- | ---------- | ----------------------------- | --------------------------- | ----------- |
| `disabled` | `disabled` |                               | `boolean`                   | `false`     |
| `label`    | `label`    | Accessible name of the group. | `string \| undefined`       | `undefined` |
| `name`     | `name`     |                               | `string \| undefined`       | `undefined` |
| `options`  | --         |                               | `KernOption[] \| undefined` | `undefined` |
| `value`    | `value`    |                               | `string`                    | `''`        |


## Events

| Event        | Description | Type                              |
| ------------ | ----------- | --------------------------------- |
| `kernChange` |             | `CustomEvent<{ value: string; }>` |


## Slots

| Slot | Description                           |
| ---- | ------------------------------------- |
|      | `<option>` elements (read, not shown) |


## Shadow Parts

| Part        | Description        |
| ----------- | ------------------ |
| `"segment"` | Each option button |


----------------------------------------------


