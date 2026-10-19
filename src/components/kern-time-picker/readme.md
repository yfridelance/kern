# kern-time-picker



<!-- Auto Generated Below -->


## Overview

Time field with segments (hours, minutes, optional seconds and AM/PM), form-associated. The value is
`HH:mm` (or `HH:mm:ss` with `seconds`), empty while a segment is missing.

Keyboard per segment: Arrow Up/Down change it (minutes in `step`), digits type it and move on, Arrow Left/Right
switch segments, Backspace clears, A/P set AM/PM. With `list`, a button opens a list of times
(every `step`, at least 5 minutes; every 30 minutes when `step` is smaller).

## Properties

| Property          | Attribute            | Description                                                                                | Type                   | Default                  |
| ----------------- | -------------------- | ------------------------------------------------------------------------------------------ | ---------------------- | ------------------------ |
| `ariaLabelText`   | `aria-label-text`    | Accessible name when there is no visible label.                                            | `string \| undefined`  | `undefined`              |
| `disabled`        | `disabled`           |                                                                                            | `boolean`              | `false`                  |
| `error`           | `error`              |                                                                                            | `string \| undefined`  | `undefined`              |
| `hint`            | `hint`               |                                                                                            | `string \| undefined`  | `undefined`              |
| `hour12`          | `hour-1-2`           | 12-hour clock with AM/PM; defaults to the locale.                                          | `boolean \| undefined` | `undefined`              |
| `label`           | `label`              |                                                                                            | `string \| undefined`  | `undefined`              |
| `labelHour`       | `label-hour`         |                                                                                            | `string`               | `'Stunden'`              |
| `labelList`       | `label-list`         |                                                                                            | `string`               | `'Zeit wählen'`          |
| `labelMinute`     | `label-minute`       |                                                                                            | `string`               | `'Minuten'`              |
| `labelOutOfRange` | `label-out-of-range` | Shown for a time outside min/max.                                                          | `string`               | `'Zeit nicht erlaubt'`   |
| `labelPeriod`     | `label-period`       |                                                                                            | `string`               | `'Vormittag/Nachmittag'` |
| `labelSecond`     | `label-second`       |                                                                                            | `string`               | `'Sekunden'`             |
| `list`            | `list`               | Button with a list of times.                                                               | `boolean`              | `false`                  |
| `locale`          | `locale`             | BCP 47 locale; defaults to `<html lang>`, then the browser language.                       | `string \| undefined`  | `undefined`              |
| `max`             | `max`                | Latest allowed time `HH:mm`.                                                               | `string \| undefined`  | `undefined`              |
| `min`             | `min`                | Earliest allowed time `HH:mm`.                                                             | `string \| undefined`  | `undefined`              |
| `name`            | `name`               |                                                                                            | `string \| undefined`  | `undefined`              |
| `readonly`        | `readonly`           |                                                                                            | `boolean`              | `false`                  |
| `required`        | `required`           |                                                                                            | `boolean`              | `false`                  |
| `seconds`         | `seconds`            | Seconds segment.                                                                           | `boolean`              | `false`                  |
| `size`            | `size`               |                                                                                            | `"md" \| "sm"`         | `'md'`                   |
| `step`            | `step`               | Step in seconds for Arrow Up/Down and the list, like `<input type="time">` (900 = 15 min). | `number`               | `60`                     |
| `value`           | `value`              | `HH:mm` or `HH:mm:ss`, empty when none.                                                    | `string`               | `''`                     |


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


