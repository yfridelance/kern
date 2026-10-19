# kern-color-picker



<!-- Auto Generated Below -->


## Overview

Colour field for smart-home lights, form-associated. `mode="color"`: `value` is `#rrggbb`; the popover has a
saturation/brightness area, a hue bar and `swatches`. `mode="temperature"`: `value` is a colour temperature in
Kelvin (`min-kelvin`–`max-kelvin`) on a warm-to-cold bar. The hex or Kelvin text can be typed (Enter or leaving
applies it). Area and bars work with pointer and keys (Arrows, Shift = larger steps, Home/End on bars).

## Properties

| Property           | Attribute           | Description                                                                                                   | Type                       | Default                      |
| ------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------- |
| `ariaLabelText`    | `aria-label-text`   | Accessible name when there is no visible label.                                                               | `string \| undefined`      | `undefined`                  |
| `disabled`         | `disabled`          |                                                                                                               | `boolean`                  | `false`                      |
| `error`            | `error`             |                                                                                                               | `string \| undefined`      | `undefined`                  |
| `hint`             | `hint`              |                                                                                                               | `string \| undefined`      | `undefined`                  |
| `kelvinStep`       | `kelvin-step`       |                                                                                                               | `number`                   | `100`                        |
| `label`            | `label`             |                                                                                                               | `string \| undefined`      | `undefined`                  |
| `labelArea`        | `label-area`        |                                                                                                               | `string`                   | `'Sättigung und Helligkeit'` |
| `labelHue`         | `label-hue`         |                                                                                                               | `string`                   | `'Farbton'`                  |
| `labelInvalid`     | `label-invalid`     |                                                                                                               | `string`                   | `'Keine gültige Farbe'`      |
| `labelOpen`        | `label-open`        |                                                                                                               | `string`                   | `'Farbe wählen'`             |
| `labelTemperature` | `label-temperature` |                                                                                                               | `string`                   | `'Farbtemperatur'`           |
| `maxKelvin`        | `max-kelvin`        |                                                                                                               | `number`                   | `6500`                       |
| `minKelvin`        | `min-kelvin`        |                                                                                                               | `number`                   | `2700`                       |
| `mode`             | `mode`              |                                                                                                               | `"color" \| "temperature"` | `'color'`                    |
| `name`             | `name`              |                                                                                                               | `string \| undefined`      | `undefined`                  |
| `readonly`         | `readonly`          |                                                                                                               | `boolean`                  | `false`                      |
| `required`         | `required`          |                                                                                                               | `boolean`                  | `false`                      |
| `size`             | `size`              |                                                                                                               | `"md" \| "sm"`             | `'md'`                       |
| `swatches`         | `swatches`          | Presets: hex colours, or Kelvin values with `mode="temperature"`, e.g. `#ff8a3c,#3cc8cc` or `2700,4000,6500`. | `string \| string[]`       | `''`                         |
| `value`            | `value`             | `#rrggbb`, or Kelvin with `mode="temperature"`.                                                               | `number \| string`         | `''`                         |


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


