# kern-checkbox



<!-- Auto Generated Below -->


## Overview

Checkbox for selection and filters ("nur mit Firmware-Update", device selection), form-associated.

## Properties

| Property        | Attribute       | Description                                                                    | Type                  | Default     |
| --------------- | --------------- | ------------------------------------------------------------------------------ | --------------------- | ----------- |
| `checked`       | `checked`       |                                                                                | `boolean`             | `false`     |
| `disabled`      | `disabled`      |                                                                                | `boolean`             | `false`     |
| `indeterminate` | `indeterminate` | Mixed state, e.g. "some devices selected". Cleared on user input.              | `boolean`             | `false`     |
| `label`         | `label`         | Accessible name when there is no visible text (e.g. row selection in a table). | `string \| undefined` | `undefined` |
| `name`          | `name`          |                                                                                | `string \| undefined` | `undefined` |
| `value`         | `value`         |                                                                                | `string`              | `'on'`      |


## Events

| Event        | Description | Type                                 |
| ------------ | ----------- | ------------------------------------ |
| `kernChange` |             | `CustomEvent<{ checked: boolean; }>` |


## Slots

| Slot | Description |
| ---- | ----------- |
|      | Label text  |


## Shadow Parts

| Part    | Description     |
| ------- | --------------- |
| `"box"` | The visible box |


----------------------------------------------


