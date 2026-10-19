# kern-date



<!-- Auto Generated Below -->


## Overview

Formatted date or point in time („19.10.2026, 10:15“) or relative („vor 3 Min.“, „gestern“) as `<time>`.
Relative texts update themselves; the absolute value with time is shown as tooltip. Invalid values are shown as given.

## Usage

### 01-formats

# Formats

`value` takes an ISO date, an ISO 8601 point in time or epoch milliseconds. `format` (`short`, `medium`, `long`, `full`) sets the length, `time` adds the time of day.

```html
<kern-kv>
  <kern-kv-item label="short"><kern-date value="2026-10-19" format="short"></kern-date></kern-kv-item>
  <kern-kv-item label="medium"><kern-date value="2026-10-19"></kern-date></kern-kv-item>
  <kern-kv-item label="long"><kern-date value="2026-10-19" format="long"></kern-date></kern-kv-item>
  <kern-kv-item label="full"><kern-date value="2026-10-19" format="full"></kern-date></kern-kv-item>
  <kern-kv-item label="time"><kern-date value="2026-10-19T09:41:00Z" time></kern-date></kern-kv-item>
</kern-kv>
```


### 02-relative

# Relative

`relative` shows the distance to now (“3 min. ago”, “yesterday”) and updates itself; the absolute point in time is shown as tooltip. Values relative to now are set from script here.

```html
<kern-kv>
  <kern-kv-item label="Last seen"><kern-date relative data-ago="45"></kern-date></kern-kv-item>
  <kern-kv-item label="Last snapshot"><kern-date relative data-ago="5400"></kern-date></kern-kv-item>
  <kern-kv-item label="Unreachable since"><kern-date relative data-ago="93000"></kern-date></kern-kv-item>
  <kern-kv-item label="Next update check"><kern-date relative data-ago="-21600"></kern-date></kern-kv-item>
</kern-kv>
```

```js
for (const el of root.querySelectorAll('kern-date[data-ago]')) el.value = Date.now() - el.dataset.ago * 1000;
```


### 03-locale-zone

# Locale and time zone

`locale` overrides the language (default: `<html lang>`, then the browser), `time-zone` takes an IANA zone (default: the browser's). The same point in time, shown for different places:

```html
<kern-kv>
  <kern-kv-item label="Zurich (de-CH)"><kern-date value="2026-10-19T07:41:00Z" time locale="de-CH" time-zone="Europe/Zurich"></kern-date></kern-kv-item>
  <kern-kv-item label="London (en-GB)"><kern-date value="2026-10-19T07:41:00Z" time locale="en-GB" time-zone="Europe/London"></kern-date></kern-kv-item>
  <kern-kv-item label="New York (en-US)"><kern-date value="2026-10-19T07:41:00Z" time locale="en-US" time-zone="America/New_York"></kern-date></kern-kv-item>
  <kern-kv-item label="Tokyo (ja-JP)"><kern-date value="2026-10-19T07:41:00Z" time format="long" locale="ja-JP" time-zone="Asia/Tokyo"></kern-date></kern-kv-item>
</kern-kv>
```



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


