# kern-tooltip



<!-- Auto Generated Below -->


## Overview

Short hint for a control or an abbreviated value, shown on hover (after `delay`) and immediately on keyboard focus;
Escape hides it. Wrap the trigger (`<kern-tooltip text="Neustart"><kern-button …></kern-tooltip>`) or point at it
with `for="id"`. The trigger gets `aria-describedby` to a hidden copy of the text. Not for essential information:
touch devices never see it.

## Properties

| Property    | Attribute   | Description                                                     | Type                  | Default     |
| ----------- | ----------- | --------------------------------------------------------------- | --------------------- | ----------- |
| `delay`     | `delay`     | Hover delay in milliseconds.                                    | `number`              | `400`       |
| `disabled`  | `disabled`  |                                                                 | `boolean`             | `false`     |
| `for`       | `for`       | Id of the trigger in the same document, instead of wrapping it. | `string \| undefined` | `undefined` |
| `placement` | `placement` | Preferred side; flips when there is no room.                    | `"bottom" \| "top"`   | `'top'`     |
| `text`      | `text`      |                                                                 | `string`              | `''`        |


## Slots

| Slot | Description                          |
| ---- | ------------------------------------ |
|      | The trigger (when `for` is not used) |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"tooltip"` | The bubble  |


----------------------------------------------


