# kern-date-range-picker



<!-- Auto Generated Below -->


## Overview

Date range field: two dates („Von“ – „Bis“) with a calendar popover (two months, one on narrow screens),
form-associated. `start` and `end` are ISO dates; `value` and the form value are the ISO 8601 interval
`start/end` (empty until both are set). Typed dates are applied on Enter or when leaving a field; an end before
the start is swapped.

Presets: elements in the `presets` slot with `data-range` (ISO 8601 duration ending today, e.g. `P7D` = the last
7 days incl. today) or `data-start`/`data-end` set the range on click.

## Properties

| Property          | Attribute            | Description                                                                               | Type                                      | Default                    |
| ----------------- | -------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------- |
| `ariaLabelText`   | `aria-label-text`    | Accessible name when there is no visible label.                                           | `string \| undefined`                     | `undefined`                |
| `clearable`       | `clearable`          | Show a button that empties both dates.                                                    | `boolean`                                 | `false`                    |
| `disabled`        | `disabled`           |                                                                                           | `boolean`                                 | `false`                    |
| `end`             | `end`                | Last day (inclusive), ISO `YYYY-MM-DD`.                                                   | `string`                                  | `''`                       |
| `error`           | `error`              |                                                                                           | `string \| undefined`                     | `undefined`                |
| `firstDayOfWeek`  | `first-day-of-week`  | 0 = Sunday … 6 = Saturday; defaults to the locale.                                        | `number \| undefined`                     | `undefined`                |
| `hint`            | `hint`               |                                                                                           | `string \| undefined`                     | `undefined`                |
| `isDateDisabled`  | --                   | Additional rule for unselectable days.                                                    | `((iso: string) => boolean) \| undefined` | `undefined`                |
| `label`           | `label`              |                                                                                           | `string \| undefined`                     | `undefined`                |
| `labelClear`      | `label-clear`        |                                                                                           | `string`                                  | `'Leeren'`                 |
| `labelEnd`        | `label-end`          |                                                                                           | `string`                                  | `'Bis'`                    |
| `labelIncomplete` | `label-incomplete`   | Shown when only one date is set.                                                          | `string`                                  | `'Start und Ende angeben'` |
| `labelInvalid`    | `label-invalid`      |                                                                                           | `string`                                  | `'Kein gültiges Datum'`    |
| `labelOpen`       | `label-open`         |                                                                                           | `string`                                  | `'Kalender öffnen'`        |
| `labelOutOfRange` | `label-out-of-range` |                                                                                           | `string`                                  | `'Datum nicht erlaubt'`    |
| `labelStart`      | `label-start`        |                                                                                           | `string`                                  | `'Von'`                    |
| `labelTooLong`    | `label-too-long`     | Shown when the range is longer than `maxDays`; `{n}` is replaced by it.                   | `string`                                  | `'Höchstens {n} Tage'`     |
| `locale`          | `locale`             | BCP 47 locale; defaults to `<html lang>`, then the browser language.                      | `string \| undefined`                     | `undefined`                |
| `max`             | `max`                | Latest allowed date.                                                                      | `string \| undefined`                     | `undefined`                |
| `maxDays`         | `max-days`           | Longest allowed range in days (inclusive).                                                | `number \| undefined`                     | `undefined`                |
| `min`             | `min`                | Earliest allowed date.                                                                    | `string \| undefined`                     | `undefined`                |
| `name`            | `name`               |                                                                                           | `string \| undefined`                     | `undefined`                |
| `readonly`        | `readonly`           |                                                                                           | `boolean`                                 | `false`                    |
| `required`        | `required`           |                                                                                           | `boolean`                                 | `false`                    |
| `showWeekNumbers` | `show-week-numbers`  | ISO week numbers in the calendar.                                                         | `boolean`                                 | `false`                    |
| `size`            | `size`               |                                                                                           | `"md" \| "sm"`                            | `'md'`                     |
| `start`           | `start`              | First day, ISO `YYYY-MM-DD`.                                                              | `string`                                  | `''`                       |
| `value`           | `value`              | ISO 8601 interval `start/end`, empty until both are set; kept in sync with `start`/`end`. | `string`                                  | `''`                       |


## Events

| Event        | Description                            | Type                                                          |
| ------------ | -------------------------------------- | ------------------------------------------------------------- |
| `kernChange` | When the range is complete or cleared. | `CustomEvent<{ start: string; end: string; value: string; }>` |


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

| Slot        | Description                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `"footer"`  | Actions below the calendar                                                                         |
| `"presets"` | Quick choices beside the calendar, e.g. `<kern-button variant="ghost" size="sm" data-range="P7D">` |


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
  kern-date-range-picker --> kern-calendar
  style kern-date-range-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------


