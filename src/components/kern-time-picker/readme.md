# kern-time-picker



<!-- Auto Generated Below -->


## Overview

Time field with segments (hours, minutes, optional seconds and AM/PM), form-associated. The value is
`HH:mm` (or `HH:mm:ss` with `seconds`), empty while a segment is missing.

Keyboard per segment: Arrow Up/Down change it (minutes in `step`), digits type it and move on, Arrow Left/Right
switch segments, Backspace clears, A/P set AM/PM. With `list`, a button opens a list of times
(every `step`, at least 5 minutes; every 30 minutes when `step` is smaller).

## Usage

### 01-basic

# Time field

Segments for hours and minutes; the value is `HH:mm`. Per segment: Arrow Up/Down change it (minutes in `step` seconds), digits type it and move on, Arrow Left/Right switch segments, Backspace clears. `locale` decides 12- or 24-hour display unless `hour12` is set.

```html
<div style="display:grid;gap:16px;max-width:240px">
  <kern-time-picker name="on" label="Switch on at" value="06:30" locale="de-CH"></kern-time-picker>
  <kern-time-picker label="Switch off at" value="22:15" locale="en-US" hint="12-hour clock: A/P set AM/PM"></kern-time-picker>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
const out = root.querySelector('output');
for (const el of root.querySelectorAll('kern-time-picker')) {
  el.addEventListener('kernChange', (e) => (out.textContent = 'kernChange → ' + e.detail.value));
}
```


### 02-list

# List, limits and seconds

`list` adds a button with a list of times every `step` (here 900 s = 15 minutes). `min` and `max` limit the time. `seconds` adds a seconds segment (`HH:mm:ss`).

```html
<div style="display:grid;gap:16px;max-width:240px">
  <kern-time-picker label="Schedule" value="06:30" step="900" list min="05:00" max="23:00" locale="de-CH"></kern-time-picker>
  <kern-time-picker label="Sunrise offset" value="00:12:30" seconds locale="de-CH" size="sm"></kern-time-picker>
  <kern-time-picker label="Quiet hours" value="22:00" locale="de-CH" disabled></kern-time-picker>
</div>
```



## Properties

| Property          | Attribute            | Description                                                                                | Type                   | Default     |
| ----------------- | -------------------- | ------------------------------------------------------------------------------------------ | ---------------------- | ----------- |
| `ariaLabelText`   | `aria-label-text`    | Accessible name when there is no visible label.                                            | `string \| undefined`  | `undefined` |
| `disabled`        | `disabled`           |                                                                                            | `boolean`              | `false`     |
| `error`           | `error`              |                                                                                            | `string \| undefined`  | `undefined` |
| `hint`            | `hint`               |                                                                                            | `string \| undefined`  | `undefined` |
| `hour12`          | `hour-1-2`           | 12-hour clock with AM/PM; defaults to the locale.                                          | `boolean \| undefined` | `undefined` |
| `label`           | `label`              |                                                                                            | `string \| undefined`  | `undefined` |
| `labelHour`       | `label-hour`         |                                                                                            | `string \| undefined`  | `undefined` |
| `labelList`       | `label-list`         |                                                                                            | `string \| undefined`  | `undefined` |
| `labelMinute`     | `label-minute`       |                                                                                            | `string \| undefined`  | `undefined` |
| `labelOutOfRange` | `label-out-of-range` | Shown for a time outside min/max.                                                          | `string \| undefined`  | `undefined` |
| `labelPeriod`     | `label-period`       |                                                                                            | `string \| undefined`  | `undefined` |
| `labelSecond`     | `label-second`       |                                                                                            | `string \| undefined`  | `undefined` |
| `list`            | `list`               | Button with a list of times.                                                               | `boolean`              | `false`     |
| `locale`          | `locale`             | BCP 47 locale; defaults to `<html lang>`, then the browser language.                       | `string \| undefined`  | `undefined` |
| `max`             | `max`                | Latest allowed time `HH:mm`.                                                               | `string \| undefined`  | `undefined` |
| `min`             | `min`                | Earliest allowed time `HH:mm`.                                                             | `string \| undefined`  | `undefined` |
| `name`            | `name`               |                                                                                            | `string \| undefined`  | `undefined` |
| `readonly`        | `readonly`           |                                                                                            | `boolean`              | `false`     |
| `required`        | `required`           |                                                                                            | `boolean`              | `false`     |
| `seconds`         | `seconds`            | Seconds segment.                                                                           | `boolean`              | `false`     |
| `size`            | `size`               |                                                                                            | `"md" \| "sm"`         | `'md'`      |
| `step`            | `step`               | Step in seconds for Arrow Up/Down and the list, like `<input type="time">` (900 = 15 min). | `number`               | `60`        |
| `value`           | `value`              | `HH:mm` or `HH:mm:ss`, empty when none.                                                    | `string`               | `''`        |


## Events

| Event        | Description                                   | Type                              |
| ------------ | --------------------------------------------- | --------------------------------- |
| `kernChange` | When the time changes (complete, or cleared). | `CustomEvent<{ value: string; }>` |


## Methods

### `hide() => Promise<void>`

Closes the list.

#### Returns

Type: `Promise<void>`



### `setFocus() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`

Opens the list (with `list`).

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part        | Description      |
| ----------- | ---------------- |
| `"control"` | The field box    |
| `"listbox"` | The popover list |


----------------------------------------------


