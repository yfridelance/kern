# kern-rating



<!-- Auto Generated Below -->


## Overview

Star rating 1–`max`, form-associated (value 0 = not rated). A radio group with one tab stop: arrow keys change the
rating, Home/End jump, with `clearable` 0/Backspace or a click on the current star clears it. Hovering previews.
`readonly` only shows the rating („4 von 5 Sternen“).

## Usage

### 01-basic

# Star rating

A radio group with one tab stop: arrow keys change the rating, Home/End jump. With `clearable`, 0, Backspace or a click on the current star clears it (value 0 = not rated). Hovering previews.

```html
<div style="display:grid;gap:16px">
  <kern-rating name="score" label="Reliability" value="4" clearable hint="How stable does the device run?" label-value="{n} of {max} stars"></kern-rating>
  <kern-rating label="Signal" max="3" value="2" size="sm" label-value="{n} of {max}"></kern-rating>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-rating').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + e.detail.value;
});
```


### 02-readonly

# Read-only and required

`readonly` only shows the rating, e.g. in a card or table. `required` blocks submitting while the value is 0; `disabled` stops interaction.

```html
<div style="display:grid;gap:16px">
  <kern-rating value="5" readonly size="sm" aria-label-text="Rating" label-value="{n} of {max} stars"></kern-rating>
  <kern-rating label="Rate this update" required error="Please rate the update"></kern-rating>
  <kern-rating label="Rating" value="3" disabled></kern-rating>
</div>
```



## Properties

| Property        | Attribute         | Description                                                                 | Type                  | Default                   |
| --------------- | ----------------- | --------------------------------------------------------------------------- | --------------------- | ------------------------- |
| `ariaLabelText` | `aria-label-text` | Accessible name when there is no visible label.                             | `string \| undefined` | `undefined`               |
| `clearable`     | `clearable`       | Allows going back to 0 (not rated).                                         | `boolean`             | `false`                   |
| `disabled`      | `disabled`        |                                                                             | `boolean`             | `false`                   |
| `error`         | `error`           |                                                                             | `string \| undefined` | `undefined`               |
| `hint`          | `hint`            |                                                                             | `string \| undefined` | `undefined`               |
| `label`         | `label`           |                                                                             | `string \| undefined` | `undefined`               |
| `labelValue`    | `label-value`     | Name of each star and the read-only rating; `{n}` and `{max}` are replaced. | `string`              | `'{n} von {max} Sternen'` |
| `max`           | `max`             | Number of stars.                                                            | `number`              | `5`                       |
| `name`          | `name`            |                                                                             | `string \| undefined` | `undefined`               |
| `readonly`      | `readonly`        | Display only, no interaction.                                               | `boolean`             | `false`                   |
| `required`      | `required`        |                                                                             | `boolean`             | `false`                   |
| `size`          | `size`            |                                                                             | `"md" \| "sm"`        | `'md'`                    |
| `value`         | `value`           | Number of filled stars, 0 = not rated.                                      | `number`              | `0`                       |


## Events

| Event        | Description              | Type                              |
| ------------ | ------------------------ | --------------------------------- |
| `kernChange` | When the rating changes. | `CustomEvent<{ value: number; }>` |


## Methods

### `setFocus() => Promise<void>`

Focuses the selected star (or the first).

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part     | Description |
| -------- | ----------- |
| `"star"` | Each star   |


----------------------------------------------


