# kern-switch



<!-- Auto Generated Below -->


## Overview

On/off switch for settings (Cloud, Bluetooth, MQTT), form-associated.
The label names the thing ("Cloud"), not the action.

## Properties

| Property   | Attribute  | Description              | Type                  | Default     |
| ---------- | ---------- | ------------------------ | --------------------- | ----------- |
| `checked`  | `checked`  |                          | `boolean`             | `false`     |
| `disabled` | `disabled` |                          | `boolean`             | `false`     |
| `name`     | `name`     |                          | `string \| undefined` | `undefined` |
| `value`    | `value`    | Form value when checked. | `string`              | `'on'`      |


## Events

| Event        | Description | Type                                 |
| ------------ | ----------- | ------------------------------------ |
| `kernChange` |             | `CustomEvent<{ checked: boolean; }>` |


## Slots

| Slot | Description |
| ---- | ----------- |
|      | Label text  |


## Shadow Parts

| Part      | Description      |
| --------- | ---------------- |
| `"track"` | The switch track |


----------------------------------------------


