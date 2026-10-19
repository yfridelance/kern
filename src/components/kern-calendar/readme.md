# kern-calendar



<!-- Auto Generated Below -->


## Overview

Month view for picking a date or a range, inline or inside a picker. Values are ISO dates (`2026-10-19`).
Keyboard (one tab stop): arrows move by day/week, Home/End to the start/end of the week, Page Up/Down by month,
with Shift by year, Enter or Space picks. In range mode the first pick sets `start`, the second `end`
(swapped if earlier); the range is previewed on hover and focus until then, Escape discards it.

## Properties

| Property          | Attribute           | Description                                                          | Type                                      | Default              |
| ----------------- | ------------------- | -------------------------------------------------------------------- | ----------------------------------------- | -------------------- |
| `end`             | `end`               | Range end (range mode).                                              | `string \| undefined`                     | `undefined`          |
| `firstDayOfWeek`  | `first-day-of-week` | 0 = Sunday … 6 = Saturday; defaults to the locale (Monday for de).   | `number \| undefined`                     | `undefined`          |
| `isDateDisabled`  | --                  | Additional rule for unselectable days, e.g. weekends.                | `((iso: string) => boolean) \| undefined` | `undefined`          |
| `label`           | `label`             | Accessible name of the calendar.                                     | `string`                                  | `'Kalender'`         |
| `labelNext`       | `label-next`        |                                                                      | `string`                                  | `'Nächster Monat'`   |
| `labelPrev`       | `label-prev`        |                                                                      | `string`                                  | `'Vorheriger Monat'` |
| `labelWeek`       | `label-week`        | Column header of the week numbers.                                   | `string`                                  | `'KW'`               |
| `locale`          | `locale`            | BCP 47 locale; defaults to `<html lang>`, then the browser language. | `string \| undefined`                     | `undefined`          |
| `max`             | `max`               | Latest selectable date.                                              | `string \| undefined`                     | `undefined`          |
| `min`             | `min`               | Earliest selectable date.                                            | `string \| undefined`                     | `undefined`          |
| `months`          | `months`            | Months shown side by side.                                           | `1 \| 2`                                  | `1`                  |
| `range`           | `range`             | Pick a range (`start`/`end`) instead of a single `value`.            | `boolean`                                 | `false`              |
| `showWeekNumbers` | `show-week-numbers` | ISO week numbers in front of each row.                               | `boolean`                                 | `false`              |
| `start`           | `start`             | Range start (range mode).                                            | `string \| undefined`                     | `undefined`          |
| `value`           | `value`             | Selected date (single mode).                                         | `string \| undefined`                     | `undefined`          |


## Events

| Event             | Description                                                               | Type                                                                 |
| ----------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `kernChange`      | A date was picked (`{ value }`), or a range completed (`{ start, end }`). | `CustomEvent<{ start: string; end: string; } \| { value: string; }>` |
| `kernMonthChange` | The shown month changed (`month` 1–12).                                   | `CustomEvent<{ year: number; month: number; }>`                      |


## Methods

### `goTo(iso: string) => Promise<void>`

Show the month of an ISO date and move the tab stop there (does not select).

#### Parameters

| Name  | Type     | Description |
| ----- | -------- | ----------- |
| `iso` | `string` |             |

#### Returns

Type: `Promise<void>`



### `setFocus() => Promise<void>`

Focus the active day.

#### Returns

Type: `Promise<void>`




## Slots

| Slot       | Description                                    |
| ---------- | ---------------------------------------------- |
| `"footer"` | Actions below the month, e.g. a „Heute“ button |


## Shadow Parts

| Part    | Description     |
| ------- | --------------- |
| `"day"` | Each day button |


----------------------------------------------


