# kern-range



<!-- Auto Generated Below -->


## Overview

Slider for brightness, volume or thresholds, form-associated. One handle (`value` is a number) or two with `range`
(`value` is `"from/to"`, the handles cannot cross). Drag or click the track; keyboard: Arrow keys ± `step`,
Page Up/Down ± a tenth of the range, Home/End to the limits. `marks` adds labelled ticks.

## Usage

### 01-basic

# Slider

Drag or click the track. Keyboard: arrow keys ± `step`, Page Up/Down ± a tenth of the range, Home/End to the limits. `marks` adds labelled ticks; the current value with `unit` is shown next to the label.

```html
<div style="display:grid;gap:24px;max-width:360px">
  <kern-range name="brightness" label="Brightness" value="60" unit="%" step="5" marks="0,25,50,75,100"></kern-range>
  <kern-range label="Volume" value="30" disabled></kern-range>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-range').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + e.detail.value;
});
```


### 02-range

# Two handles

With `range`, `value` is `"from/to"` and the handles cannot cross. `label-from` and `label-to` name the handles for screen readers.

```html
<div style="max-width:360px">
  <kern-range name="window" label="Active between" range value="8/18" min="0" max="24" unit="h" marks="0,6,12,18,24" hint="No notifications outside this window" label-from="From" label-to="To"></kern-range>
</div>
```



## Properties

| Property        | Attribute         | Description                                                                      | Type                  | Default     |
| --------------- | ----------------- | -------------------------------------------------------------------------------- | --------------------- | ----------- |
| `ariaLabelText` | `aria-label-text` | Accessible name when there is no visible label.                                  | `string \| undefined` | `undefined` |
| `disabled`      | `disabled`        |                                                                                  | `boolean`             | `false`     |
| `error`         | `error`           |                                                                                  | `string \| undefined` | `undefined` |
| `hint`          | `hint`            |                                                                                  | `string \| undefined` | `undefined` |
| `label`         | `label`           |                                                                                  | `string \| undefined` | `undefined` |
| `labelFrom`     | `label-from`      |                                                                                  | `string`              | `'Von'`     |
| `labelTo`       | `label-to`        |                                                                                  | `string`              | `'Bis'`     |
| `locale`        | `locale`          | BCP 47 locale for numbers; defaults to `<html lang>`, then the browser language. | `string \| undefined` | `undefined` |
| `marks`         | `marks`           | Ticks with labels, e.g. `0,25,50,75,100`.                                        | `number[] \| string`  | `''`        |
| `max`           | `max`             |                                                                                  | `number`              | `100`       |
| `min`           | `min`             |                                                                                  | `number`              | `0`         |
| `name`          | `name`            |                                                                                  | `string \| undefined` | `undefined` |
| `range`         | `range`           | Two handles; `value` becomes `"from/to"`.                                        | `boolean`             | `false`     |
| `showValue`     | `show-value`      | Show the current value next to the label.                                        | `boolean`             | `true`      |
| `step`          | `step`            |                                                                                  | `number`              | `1`         |
| `unit`          | `unit`            | Unit after the shown value, e.g. „%“.                                            | `string \| undefined` | `undefined` |
| `value`         | `value`           | A number, or `"from/to"` with `range`.                                           | `number \| string`    | `0`         |


## Events

| Event        | Description                                  | Type                                        |
| ------------ | -------------------------------------------- | ------------------------------------------- |
| `kernChange` | When a drag ends or a key changed the value. | `CustomEvent<{ value: string \| number; }>` |
| `kernInput`  | While dragging or on every key step.         | `CustomEvent<{ value: string \| number; }>` |


## Methods

### `setFocus() => Promise<void>`

Focuses the (first) handle.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part      | Description |
| --------- | ----------- |
| `"thumb"` | Each handle |
| `"track"` | The track   |


----------------------------------------------


