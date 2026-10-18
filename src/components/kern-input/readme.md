# kern-input



<!-- Auto Generated Below -->


## Overview

Labelled text field (text, password, search, number …), form-associated.
Use `mono` for IP, MAC, CIDR and IDs.

## Properties

| Property        | Attribute         | Description                                     | Type                                                                        | Default     |
| --------------- | ----------------- | ----------------------------------------------- | --------------------------------------------------------------------------- | ----------- |
| `ariaLabelText` | `aria-label-text` | Accessible name when there is no visible label. | `string \| undefined`                                                       | `undefined` |
| `autocomplete`  | `autocomplete`    |                                                 | `string \| undefined`                                                       | `undefined` |
| `disabled`      | `disabled`        |                                                 | `boolean`                                                                   | `false`     |
| `error`         | `error`           | Error text; also marks the field invalid.       | `string \| undefined`                                                       | `undefined` |
| `hint`          | `hint`            |                                                 | `string \| undefined`                                                       | `undefined` |
| `label`         | `label`           |                                                 | `string \| undefined`                                                       | `undefined` |
| `max`           | `max`             |                                                 | `number \| string \| undefined`                                             | `undefined` |
| `maxlength`     | `maxlength`       |                                                 | `number \| undefined`                                                       | `undefined` |
| `min`           | `min`             | For `type="number"`.                            | `number \| string \| undefined`                                             | `undefined` |
| `mono`          | `mono`            |                                                 | `boolean`                                                                   | `false`     |
| `name`          | `name`            |                                                 | `string \| undefined`                                                       | `undefined` |
| `pattern`       | `pattern`         |                                                 | `string \| undefined`                                                       | `undefined` |
| `placeholder`   | `placeholder`     |                                                 | `string \| undefined`                                                       | `undefined` |
| `readonly`      | `readonly`        |                                                 | `boolean`                                                                   | `false`     |
| `required`      | `required`        |                                                 | `boolean`                                                                   | `false`     |
| `size`          | `size`            |                                                 | `"md" \| "sm"`                                                              | `'md'`      |
| `step`          | `step`            |                                                 | `number \| string \| undefined`                                             | `undefined` |
| `type`          | `type`            |                                                 | `"email" \| "number" \| "password" \| "search" \| "tel" \| "text" \| "url"` | `'text'`    |
| `value`         | `value`           |                                                 | `string`                                                                    | `''`        |


## Events

| Event        | Description                                                   | Type                              |
| ------------ | ------------------------------------------------------------- | --------------------------------- |
| `kernChange` | On every keystroke (also used by the Angular value accessor). | `CustomEvent<{ value: string; }>` |
| `kernInput`  | On every keystroke.                                           | `CustomEvent<{ value: string; }>` |


## Methods

### `select() => Promise<void>`

Selects the text.

#### Returns

Type: `Promise<void>`



### `setFocus() => Promise<void>`

Focuses the native input.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part        | Description      |
| ----------- | ---------------- |
| `"control"` | The native input |


----------------------------------------------


