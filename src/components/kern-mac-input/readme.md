# kern-mac-input



<!-- Auto Generated Below -->


## Overview

MAC address field, form-associated. Accepts every common notation (`C82B961A3F00`, `c8:2b:…`, `c8-2b-…`,
`c82b.961a.3f00`) and normalises on Enter or when leaving the field to `format` and `letter-case`; `value` and the
form value are the normalised form.

## Properties

| Property        | Attribute         | Description                                                                                               | Type                                    | Default                       |
| --------------- | ----------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------- |
| `ariaLabelText` | `aria-label-text` | Accessible name when there is no visible label.                                                           | `string \| undefined`                   | `undefined`                   |
| `disabled`      | `disabled`        |                                                                                                           | `boolean`                               | `false`                       |
| `error`         | `error`           |                                                                                                           | `string \| undefined`                   | `undefined`                   |
| `format`        | `format`          | Notation of `value`: `C8:2B:…` (colon), `C8-2B-…` (dash), `c82b.961a.3f00` (dot), `C82B961A3F00` (plain). | `"colon" \| "dash" \| "dot" \| "plain"` | `'colon'`                     |
| `hint`          | `hint`            |                                                                                                           | `string \| undefined`                   | `undefined`                   |
| `label`         | `label`           |                                                                                                           | `string \| undefined`                   | `undefined`                   |
| `labelInvalid`  | `label-invalid`   |                                                                                                           | `string`                                | `'Keine gültige MAC-Adresse'` |
| `letterCase`    | `letter-case`     |                                                                                                           | `"lower" \| "upper"`                    | `'upper'`                     |
| `name`          | `name`            |                                                                                                           | `string \| undefined`                   | `undefined`                   |
| `placeholder`   | `placeholder`     | Defaults to an example in `format`.                                                                       | `string \| undefined`                   | `undefined`                   |
| `readonly`      | `readonly`        |                                                                                                           | `boolean`                               | `false`                       |
| `required`      | `required`        |                                                                                                           | `boolean`                               | `false`                       |
| `size`          | `size`            |                                                                                                           | `"md" \| "sm"`                          | `'md'`                        |
| `value`         | `value`           | Normalised MAC address; empty when none.                                                                  | `string`                                | `''`                          |


## Events

| Event        | Description                                                                 | Type                              |
| ------------ | --------------------------------------------------------------------------- | --------------------------------- |
| `kernChange` | When typed text is applied, with the normalised value (empty when cleared). | `CustomEvent<{ value: string; }>` |
| `kernInput`  | On every keystroke, with the raw text.                                      | `CustomEvent<{ value: string; }>` |


## Methods

### `setFocus() => Promise<void>`

Focuses the native input.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"control"` |             |


----------------------------------------------


