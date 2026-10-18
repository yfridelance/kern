# kern-textarea



<!-- Auto Generated Below -->


## Overview

Labelled multi-line text field, form-associated. For notes and scripts.

## Properties

| Property        | Attribute         | Description | Type                  | Default     |
| --------------- | ----------------- | ----------- | --------------------- | ----------- |
| `ariaLabelText` | `aria-label-text` |             | `string \| undefined` | `undefined` |
| `disabled`      | `disabled`        |             | `boolean`             | `false`     |
| `error`         | `error`           |             | `string \| undefined` | `undefined` |
| `hint`          | `hint`            |             | `string \| undefined` | `undefined` |
| `label`         | `label`           |             | `string \| undefined` | `undefined` |
| `maxlength`     | `maxlength`       |             | `number \| undefined` | `undefined` |
| `mono`          | `mono`            |             | `boolean`             | `false`     |
| `name`          | `name`            |             | `string \| undefined` | `undefined` |
| `placeholder`   | `placeholder`     |             | `string \| undefined` | `undefined` |
| `readonly`      | `readonly`        |             | `boolean`             | `false`     |
| `required`      | `required`        |             | `boolean`             | `false`     |
| `rows`          | `rows`            |             | `number`              | `4`         |
| `value`         | `value`           |             | `string`              | `''`        |


## Events

| Event        | Description | Type                              |
| ------------ | ----------- | --------------------------------- |
| `kernChange` |             | `CustomEvent<{ value: string; }>` |
| `kernInput`  |             | `CustomEvent<{ value: string; }>` |


## Methods

### `setFocus() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part        | Description         |
| ----------- | ------------------- |
| `"control"` | The native textarea |


----------------------------------------------


