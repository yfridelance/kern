# kern-step-input



<!-- Auto Generated Below -->


## Overview

Number field with − and + buttons, form-associated. `value` is a number (`''` when empty); typed text is applied on
Enter or when leaving the field, limited to `min`/`max` and rounded to the decimals of `step`. Accepts the locale's
decimal comma. Keyboard: Arrow Up/Down ± `step`, Page Up/Down ± 10 × `step`, Home/End = `min`/`max`; holding a
button repeats.

## Properties

| Property        | Attribute         | Description                                                                                    | Type                  | Default                |
| --------------- | ----------------- | ---------------------------------------------------------------------------------------------- | --------------------- | ---------------------- |
| `ariaLabelText` | `aria-label-text` | Accessible name when there is no visible label.                                                | `string \| undefined` | `undefined`            |
| `disabled`      | `disabled`        |                                                                                                | `boolean`             | `false`                |
| `error`         | `error`           |                                                                                                | `string \| undefined` | `undefined`            |
| `hint`          | `hint`            |                                                                                                | `string \| undefined` | `undefined`            |
| `label`         | `label`           |                                                                                                | `string \| undefined` | `undefined`            |
| `labelDecrease` | `label-decrease`  |                                                                                                | `string`              | `'Verringern'`         |
| `labelIncrease` | `label-increase`  |                                                                                                | `string`              | `'Erhöhen'`            |
| `labelInvalid`  | `label-invalid`   | Shown for text that is not a number.                                                           | `string`              | `'Keine gültige Zahl'` |
| `locale`        | `locale`          | BCP 47 locale for the decimal separator; defaults to `<html lang>`, then the browser language. | `string \| undefined` | `undefined`            |
| `max`           | `max`             |                                                                                                | `number \| undefined` | `undefined`            |
| `min`           | `min`             |                                                                                                | `number \| undefined` | `undefined`            |
| `name`          | `name`            |                                                                                                | `string \| undefined` | `undefined`            |
| `placeholder`   | `placeholder`     |                                                                                                | `string \| undefined` | `undefined`            |
| `readonly`      | `readonly`        |                                                                                                | `boolean`             | `false`                |
| `required`      | `required`        |                                                                                                | `boolean`             | `false`                |
| `size`          | `size`            |                                                                                                | `"md" \| "sm"`        | `'md'`                 |
| `step`          | `step`            | Step for buttons and keys; its decimals set the precision (0.5 → one decimal).                 | `number`              | `1`                    |
| `unit`          | `unit`            | Unit after the number, e.g. „°C“, „%“, „s“.                                                    | `string \| undefined` | `undefined`            |
| `value`         | `value`           | The number, or `''` when empty.                                                                | `"" \| number`        | `''`                   |


## Events

| Event        | Description                                    | Type                                      |
| ------------ | ---------------------------------------------- | ----------------------------------------- |
| `kernChange` | When the number changes (`null` when emptied). | `CustomEvent<{ value: number \| null; }>` |


## Methods

### `setFocus() => Promise<void>`

Focuses the field.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part        | Description   |
| ----------- | ------------- |
| `"control"` | The field box |


----------------------------------------------


