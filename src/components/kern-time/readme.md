# kern-time



<!-- Auto Generated Below -->


## Overview

Time of day („06:30“) or duration („1 Std., 23 Min.“) as `<time>`. Set either `value` or `duration`.
Invalid values are shown as given.

## Properties

| Property   | Attribute   | Description                                                                                             | Type                                    | Default     |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------- |
| `duration` | `duration`  | ISO 8601 duration (`PT1H23M`) or seconds (`5025`, e.g. uptime). Takes precedence over `value`.          | `number \| string \| undefined`         | `undefined` |
| `hour12`   | `hour-1-2`  | 12-hour clock; defaults to the locale.                                                                  | `boolean \| undefined`                  | `undefined` |
| `locale`   | `locale`    | BCP 47 locale; defaults to `<html lang>`, then the browser language.                                    | `string \| undefined`                   | `undefined` |
| `mono`     | `mono`      | Monospace digits, e.g. in tables next to IDs.                                                           | `boolean`                               | `false`     |
| `seconds`  | `seconds`   | Show seconds of a time of day.                                                                          | `boolean`                               | `false`     |
| `timeZone` | `time-zone` | IANA time zone for points in time; defaults to the browser's.                                           | `string \| undefined`                   | `undefined` |
| `value`    | `value`     | Time of day `HH:mm[:ss]`, or an ISO 8601 point in time / epoch milliseconds / Date whose time is shown. | `Date \| number \| string \| undefined` | `undefined` |


----------------------------------------------


