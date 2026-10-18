# kern-select



<!-- Auto Generated Below -->


## Overview

Labelled single choice, form-associated. Options come from the `options` property or from child
`<option>` elements (kept in sync, so `@for` / `*ngFor` over options works).

## Properties

| Property        | Attribute         | Description                                      | Type                        | Default     |
| --------------- | ----------------- | ------------------------------------------------ | --------------------------- | ----------- |
| `ariaLabelText` | `aria-label-text` |                                                  | `string \| undefined`       | `undefined` |
| `disabled`      | `disabled`        |                                                  | `boolean`                   | `false`     |
| `error`         | `error`           |                                                  | `string \| undefined`       | `undefined` |
| `hint`          | `hint`            |                                                  | `string \| undefined`       | `undefined` |
| `label`         | `label`           |                                                  | `string \| undefined`       | `undefined` |
| `name`          | `name`            |                                                  | `string \| undefined`       | `undefined` |
| `options`       | --                | Takes precedence over child `<option>` elements. | `KernOption[] \| undefined` | `undefined` |
| `required`      | `required`        |                                                  | `boolean`                   | `false`     |
| `size`          | `size`            |                                                  | `"md" \| "sm"`              | `'md'`      |
| `value`         | `value`           |                                                  | `string`                    | `''`        |


## Events

| Event        | Description                    | Type                              |
| ------------ | ------------------------------ | --------------------------------- |
| `kernChange` | When the user picks an option. | `CustomEvent<{ value: string; }>` |


## Methods

### `setFocus() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description                           |
| ---- | ------------------------------------- |
|      | `<option>` elements (read, not shown) |


## Shadow Parts

| Part        | Description       |
| ----------- | ----------------- |
| `"control"` | The native select |


----------------------------------------------


