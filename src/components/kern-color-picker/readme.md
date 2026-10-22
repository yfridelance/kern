# kern-color-picker



<!-- Auto Generated Below -->


## Overview

Colour field for smart-home lights, form-associated. `mode="color"`: `value` is `#rrggbb`; the popover has a
saturation/brightness area, a hue bar and `swatches`. `mode="temperature"`: `value` is a colour temperature in
Kelvin (`min-kelvin`–`max-kelvin`) on a warm-to-cold bar. The hex or Kelvin text can be typed (Enter or leaving
applies it). Area and bars work with pointer and keys (Arrows, Shift = larger steps, Home/End on bars).

## Usage

### 01-color

# Light colour

`mode="color"` (default): `value` is `#rrggbb`. The popover has a saturation/brightness area, a hue bar and `swatches`. The hex text can be typed (Enter or leaving applies it). Area and bar work with the arrow keys; Shift takes larger steps.

```html
<div style="display:grid;gap:16px;max-width:280px">
  <kern-color-picker name="color" label="Light colour" value="#3cc8cc" swatches="#ff8a3c,#ffd23c,#3cc8cc,#7fa8ff,#e58bbf,#ffffff"></kern-color-picker>
  <kern-color-picker label="Status LED" value="#ff8a3c" size="sm" disabled></kern-color-picker>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
const picker = root.querySelector('kern-color-picker');
const out = root.querySelector('output');
picker.addEventListener('kernInput', (e) => (out.textContent = 'kernInput → ' + e.detail.value));
picker.addEventListener('kernChange', (e) => (out.textContent = 'kernChange → ' + e.detail.value));
```


### 02-temperature

# Color temperature

`mode="temperature"`: `value` is a colour temperature in Kelvin between `min-kelvin` and `max-kelvin` on a warm-to-cold bar, in steps of `kelvin-step`. Swatches are Kelvin values.

```html
<div style="display:grid;gap:16px;max-width:280px">
  <kern-color-picker name="white" label="White tone" mode="temperature" value="3000" swatches="2700,3000,4000,5000,6500"></kern-color-picker>
  <kern-color-picker label="Desk lamp" mode="temperature" value="4000" min-kelvin="3000" max-kelvin="5000" kelvin-step="250" readonly></kern-color-picker>
</div>
```



## Properties

| Property           | Attribute            | Description                                                                                                   | Type                       | Default     |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------- |
| `ariaLabelText`    | `aria-label-text`    | Accessible name when there is no visible label.                                                               | `string \| undefined`      | `undefined` |
| `disabled`         | `disabled`           |                                                                                                               | `boolean`                  | `false`     |
| `error`            | `error`              |                                                                                                               | `string \| undefined`      | `undefined` |
| `hint`             | `hint`               |                                                                                                               | `string \| undefined`      | `undefined` |
| `kelvinStep`       | `kelvin-step`        |                                                                                                               | `number`                   | `100`       |
| `label`            | `label`              |                                                                                                               | `string \| undefined`      | `undefined` |
| `labelArea`        | `label-area`         |                                                                                                               | `string \| undefined`      | `undefined` |
| `labelHue`         | `label-hue`          |                                                                                                               | `string \| undefined`      | `undefined` |
| `labelInvalid`     | `label-invalid`      |                                                                                                               | `string \| undefined`      | `undefined` |
| `labelOpen`        | `label-open`         |                                                                                                               | `string \| undefined`      | `undefined` |
| `labelTemperature` | `label-temperature`  |                                                                                                               | `string \| undefined`      | `undefined` |
| `maxKelvin`        | `max-kelvin`         |                                                                                                               | `number`                   | `6500`      |
| `minKelvin`        | `min-kelvin`         |                                                                                                               | `number`                   | `2700`      |
| `mode`             | `mode`               |                                                                                                               | `"color" \| "temperature"` | `'color'`   |
| `name`             | `name`               |                                                                                                               | `string \| undefined`      | `undefined` |
| `noImplicitSubmit` | `no-implicit-submit` | Enter does not submit the surrounding form.                                                                   | `boolean`                  | `false`     |
| `readonly`         | `readonly`           |                                                                                                               | `boolean`                  | `false`     |
| `required`         | `required`           |                                                                                                               | `boolean`                  | `false`     |
| `size`             | `size`               |                                                                                                               | `"md" \| "sm"`             | `'md'`      |
| `swatches`         | `swatches`           | Presets: hex colours, or Kelvin values with `mode="temperature"`, e.g. `#ff8a3c,#3cc8cc` or `2700,4000,6500`. | `string \| string[]`       | `''`        |
| `value`            | `value`              | `#rrggbb`, or Kelvin with `mode="temperature"`.                                                               | `number \| string`         | `''`        |


## Events

| Event        | Description                                                   | Type                                        |
| ------------ | ------------------------------------------------------------- | ------------------------------------------- |
| `kernChange` | When a colour is applied (drag end, key, swatch, typed text). | `CustomEvent<{ value: string \| number; }>` |
| `kernInput`  | While dragging or stepping.                                   | `CustomEvent<{ value: string \| number; }>` |


## Methods

### `hide() => Promise<void>`

Closes the colour panel.

#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`

Opens the colour panel.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part        | Description   |
| ----------- | ------------- |
| `"control"` | The field box |
| `"panel"`   | The popover   |


----------------------------------------------


