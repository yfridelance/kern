# kern-menu-item



<!-- Auto Generated Below -->


## Overview

One action in kern-menu, with optional icon; `tone="danger"` for destructive actions (Werksreset, Löschen).

## Properties

| Property   | Attribute  | Description                                   | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Default     |
| ---------- | ---------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `disabled` | `disabled` |                                               | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `false`     |
| `icon`     | `icon`     | Glyph name (see kern-icon).                   | `"bulb" \| "calendar" \| "check" \| "chevron-down" \| "chevron-left" \| "chevron-right" \| "chevron-up" \| "clock" \| "close" \| "copy" \| "download" \| "edit" \| "external" \| "eye" \| "eye-off" \| "filter" \| "home" \| "info" \| "link" \| "lock" \| "menu" \| "minus" \| "moon" \| "more" \| "plus" \| "power" \| "refresh" \| "search" \| "settings" \| "star" \| "sun" \| "thermometer" \| "trash" \| "upload" \| "warn" \| "wifi" \| undefined` | `undefined` |
| `tone`     | `tone`     |                                               | `"danger" \| "default"`                                                                                                                                                                                                                                                                                                                                                                                                                                   | `'default'` |
| `value`    | `value`    | Passed in `kernSelect`; defaults to the text. | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                     | `undefined` |


## Events

| Event                | Description                                 | Type                              |
| -------------------- | ------------------------------------------- | --------------------------------- |
| `kernMenuItemSelect` | Asks the menu to pick this item (internal). | `CustomEvent<{ value: string; }>` |


## Slots

| Slot | Description |
| ---- | ----------- |
|      | Text        |


----------------------------------------------


