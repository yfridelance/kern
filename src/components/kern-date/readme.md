# kern-date



<!-- Auto Generated Below -->


## Overview

Formatted date or point in time („19.10.2026, 10:15“) or relative („vor 3 Min.“, „gestern“) as `<time>`.
Relative texts update themselves; the absolute value with time is shown as tooltip. Invalid values are shown as given.

## Properties

| Property   | Attribute   | Description                                                                    | Type                                      | Default     |
| ---------- | ----------- | ------------------------------------------------------------------------------ | ----------------------------------------- | ----------- |
| `format`   | `format`    | Length of the date (`Intl.DateTimeFormat` dateStyle).                          | `"full" \| "long" \| "medium" \| "short"` | `'medium'`  |
| `locale`   | `locale`    | BCP 47 locale; defaults to `<html lang>`, then the browser language.           | `string \| undefined`                     | `undefined` |
| `relative` | `relative`  | Relative to now, e.g. „vor 3 Min.“.                                            | `boolean`                                 | `false`     |
| `time`     | `time`      | Also show the time (not for calendar dates).                                   | `boolean`                                 | `false`     |
| `timeZone` | `time-zone` | IANA time zone, e.g. `Europe/Zurich`; defaults to the browser's.               | `string \| undefined`                     | `undefined` |
| `value`    | `value`     | ISO date (`2026-10-19`), ISO 8601 point in time, epoch milliseconds or a Date. | `Date \| number \| string \| undefined`   | `undefined` |


----------------------------------------------


