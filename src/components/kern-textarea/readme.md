# kern-textarea



<!-- Auto Generated Below -->


## Overview

Labelled multi-line text field, form-associated. For notes and scripts.

## Usage

### 01-basic

# Notes and scripts

A multi-line field with `rows`, `maxlength` and `hint`. `mono` suits scripts and configuration snippets.

```html
<div style="display:grid;gap:16px;max-width:480px">
  <kern-textarea label="Notes" placeholder="Where is the device mounted?" maxlength="500" hint="Up to 500 characters"></kern-textarea>
  <kern-textarea label="Script" rows="6" mono value="Shelly.call('Switch.Set', { id: 0, on: true });"></kern-textarea>
</div>
```


### 02-states

# Error, read-only and disabled

`error` marks the field invalid; `required` blocks an empty form submission.

```html
<div style="display:grid;gap:16px;max-width:480px">
  <kern-textarea label="Reason for factory reset" required rows="3" error="Please give a reason"></kern-textarea>
  <kern-textarea label="Last log line" rows="2" mono readonly value="[12:04:31] wifi: connected to Home (-61 dBm)"></kern-textarea>
  <kern-textarea label="Comment" rows="2" disabled value="Locked while the update runs"></kern-textarea>
</div>
```



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


