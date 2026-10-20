# kern-step-input



<!-- Auto Generated Below -->


## Overview

Number field with − and + buttons, form-associated. `value` is a number (`''` when empty); typed text is applied on
Enter or when leaving the field, limited to `min`/`max` and rounded to the decimals of `step`. Accepts the locale's
decimal comma. Keyboard: Arrow Up/Down ± `step`, Page Up/Down ± 10 × `step`, Home/End = `min`/`max`; holding a
button repeats.

## Usage

### 01-basic

# Number with steps

`value` is a number, limited to `min`/`max` and rounded to the decimals of `step`; `unit` follows the number. The field accepts the locale's decimal comma. Keyboard: Arrow Up/Down ± `step`, Page Up/Down ± 10 × `step`, Home/End jump to `min`/`max`; holding a button repeats.

```html
<div style="display:grid;gap:16px;max-width:280px">
  <kern-step-input label="Target temperature" value="21.5" min="5" max="30" step="0.5" unit="°C" locale="en"></kern-step-input>
  <kern-step-input label="Timeout" value="30" min="1" max="600" unit="s" size="sm" hint="1–600 seconds"></kern-step-input>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
const out = root.querySelector('output');
for (const el of root.querySelectorAll('kern-step-input')) {
  el.addEventListener('kernChange', (e) => (out.textContent = 'kernChange → ' + e.detail.value));
}
```


### 02-states

# Locale, required and states

With `locale="de-DE"` the field shows and accepts a decimal comma (`-0,25`). `required` blocks an empty submission; `readonly` and `disabled` stop changes.

```html
<div style="display:grid;gap:16px;max-width:280px">
  <kern-step-input label="Offset" value="-0.25" min="-5" max="5" step="0.25" unit="°C" locale="de-DE"></kern-step-input>
  <kern-step-input label="Auto-off" min="0" max="120" unit="min" required placeholder="Minutes"></kern-step-input>
  <kern-step-input label="Max. power" value="3500" unit="W" readonly></kern-step-input>
  <kern-step-input label="Brightness" value="60" unit="%" disabled></kern-step-input>
</div>
```



## Properties

| Property        | Attribute         | Description                                                                                    | Type                  | Default     |
| --------------- | ----------------- | ---------------------------------------------------------------------------------------------- | --------------------- | ----------- |
| `ariaLabelText` | `aria-label-text` | Accessible name when there is no visible label.                                                | `string \| undefined` | `undefined` |
| `disabled`      | `disabled`        |                                                                                                | `boolean`             | `false`     |
| `error`         | `error`           |                                                                                                | `string \| undefined` | `undefined` |
| `hint`          | `hint`            |                                                                                                | `string \| undefined` | `undefined` |
| `label`         | `label`           |                                                                                                | `string \| undefined` | `undefined` |
| `labelDecrease` | `label-decrease`  |                                                                                                | `string \| undefined` | `undefined` |
| `labelIncrease` | `label-increase`  |                                                                                                | `string \| undefined` | `undefined` |
| `labelInvalid`  | `label-invalid`   | Shown for text that is not a number.                                                           | `string \| undefined` | `undefined` |
| `locale`        | `locale`          | BCP 47 locale for the decimal separator; defaults to `<html lang>`, then the browser language. | `string \| undefined` | `undefined` |
| `max`           | `max`             |                                                                                                | `number \| undefined` | `undefined` |
| `min`           | `min`             |                                                                                                | `number \| undefined` | `undefined` |
| `name`          | `name`            |                                                                                                | `string \| undefined` | `undefined` |
| `placeholder`   | `placeholder`     |                                                                                                | `string \| undefined` | `undefined` |
| `readonly`      | `readonly`        |                                                                                                | `boolean`             | `false`     |
| `required`      | `required`        |                                                                                                | `boolean`             | `false`     |
| `size`          | `size`            |                                                                                                | `"md" \| "sm"`        | `'md'`      |
| `step`          | `step`            | Step for buttons and keys; its decimals set the precision (0.5 → one decimal).                 | `number`              | `1`         |
| `unit`          | `unit`            | Unit after the number, e.g. „°C“, „%“, „s“.                                                    | `string \| undefined` | `undefined` |
| `value`         | `value`           | The number, or `''` when empty.                                                                | `"" \| number`        | `''`        |


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


