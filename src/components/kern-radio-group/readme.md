# kern-radio-group



<!-- Auto Generated Below -->


## Overview

Single choice from kern-radio children, form-associated. For longer or described options; for 2–5 short ones use
kern-segmented. One tab stop: arrow keys move and select (wrapping), Space/Enter selects the focused option.

## Properties

| Property        | Attribute         | Description                                       | Type                         | Default      |
| --------------- | ----------------- | ------------------------------------------------- | ---------------------------- | ------------ |
| `ariaLabelText` | `aria-label-text` | Accessible name when there is no visible label.   | `string \| undefined`        | `undefined`  |
| `disabled`      | `disabled`        |                                                   | `boolean`                    | `false`      |
| `error`         | `error`           |                                                   | `string \| undefined`        | `undefined`  |
| `hint`          | `hint`            |                                                   | `string \| undefined`        | `undefined`  |
| `label`         | `label`           |                                                   | `string \| undefined`        | `undefined`  |
| `name`          | `name`            |                                                   | `string \| undefined`        | `undefined`  |
| `orientation`   | `orientation`     | Layout of the options.                            | `"horizontal" \| "vertical"` | `'vertical'` |
| `required`      | `required`        |                                                   | `boolean`                    | `false`      |
| `value`         | `value`           | Value of the checked kern-radio, empty when none. | `string`                     | `''`         |


## Events

| Event        | Description                    | Type                              |
| ------------ | ------------------------------ | --------------------------------- |
| `kernChange` | When the user picks an option. | `CustomEvent<{ value: string; }>` |


## Methods

### `setFocus() => Promise<void>`

Focuses the checked option (or the first).

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description         |
| ---- | ------------------- |
|      | kern-radio elements |


----------------------------------------------


