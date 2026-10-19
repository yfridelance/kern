# kern-date-picker



<!-- Auto Generated Below -->


## Overview

Date field with a calendar popover, form-associated. The value is an ISO date (`2026-10-19`); the field shows
and accepts the locale's numeric format („19.10.2026“, also „19.10.“ or ISO). Typed text is applied on Enter or
when leaving the field; invalid or out-of-range dates mark the field invalid.

Keyboard: Arrow Down or Alt+Arrow Down opens the calendar (keyboard as in kern-calendar), Enter or Space picks,
Escape closes. Elements in the `footer` slot appear below the calendar; clicking one closes it.

## Properties

| Property          | Attribute            | Description                                                          | Type                                      | Default                 |
| ----------------- | -------------------- | -------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| `ariaLabelText`   | `aria-label-text`    | Accessible name when there is no visible label.                      | `string \| undefined`                     | `undefined`             |
| `clearable`       | `clearable`          | Show a button that empties the field.                                | `boolean`                                 | `false`                 |
| `disabled`        | `disabled`           |                                                                      | `boolean`                                 | `false`                 |
| `error`           | `error`              |                                                                      | `string \| undefined`                     | `undefined`             |
| `firstDayOfWeek`  | `first-day-of-week`  | 0 = Sunday … 6 = Saturday; defaults to the locale.                   | `number \| undefined`                     | `undefined`             |
| `hint`            | `hint`               |                                                                      | `string \| undefined`                     | `undefined`             |
| `isDateDisabled`  | --                   | Additional rule for unselectable days, e.g. weekends.                | `((iso: string) => boolean) \| undefined` | `undefined`             |
| `label`           | `label`              |                                                                      | `string \| undefined`                     | `undefined`             |
| `labelClear`      | `label-clear`        |                                                                      | `string`                                  | `'Leeren'`              |
| `labelInvalid`    | `label-invalid`      | Shown for text that is not a date.                                   | `string`                                  | `'Kein gültiges Datum'` |
| `labelOpen`       | `label-open`         |                                                                      | `string`                                  | `'Kalender öffnen'`     |
| `labelOutOfRange` | `label-out-of-range` | Shown for a date outside min/max or disabled.                        | `string`                                  | `'Datum nicht erlaubt'` |
| `locale`          | `locale`             | BCP 47 locale; defaults to `<html lang>`, then the browser language. | `string \| undefined`                     | `undefined`             |
| `max`             | `max`                | Latest allowed date.                                                 | `string \| undefined`                     | `undefined`             |
| `min`             | `min`                | Earliest allowed date.                                               | `string \| undefined`                     | `undefined`             |
| `name`            | `name`               |                                                                      | `string \| undefined`                     | `undefined`             |
| `placeholder`     | `placeholder`        | Defaults to the locale's format, e.g. „TT.MM.JJJJ“.                  | `string \| undefined`                     | `undefined`             |
| `readonly`        | `readonly`           |                                                                      | `boolean`                                 | `false`                 |
| `required`        | `required`           |                                                                      | `boolean`                                 | `false`                 |
| `showWeekNumbers` | `show-week-numbers`  | ISO week numbers in the calendar.                                    | `boolean`                                 | `false`                 |
| `size`            | `size`               |                                                                      | `"md" \| "sm"`                            | `'md'`                  |
| `value`           | `value`              | ISO date `YYYY-MM-DD`, empty when none.                              | `string`                                  | `''`                    |


## Events

| Event        | Description                                                    | Type                              |
| ------------ | -------------------------------------------------------------- | --------------------------------- |
| `kernChange` | When the date changes (picked, typed and applied, or cleared). | `CustomEvent<{ value: string; }>` |


## Methods

### `hide() => Promise<void>`

Closes the calendar.

#### Returns

Type: `Promise<void>`



### `setFocus() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`

Opens the calendar.

#### Returns

Type: `Promise<void>`




## Slots

| Slot       | Description                              |
| ---------- | ---------------------------------------- |
| `"footer"` | Actions below the calendar, e.g. „Heute“ |


## Shadow Parts

| Part         | Description       |
| ------------ | ----------------- |
| `"calendar"` | The popover panel |
| `"control"`  | The field box     |


## Dependencies

### Depends on

- [kern-calendar](../kern-calendar)

### Graph
```mermaid
graph TD;
  kern-date-picker --> kern-calendar
  style kern-date-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------


