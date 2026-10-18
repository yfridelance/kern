# kern-status



<!-- Auto Generated Below -->


## Overview

State of a device, job or server: a dot whose shape and colour differ per tone, plus the word.
ok = circle, warn = diamond, danger = square, busy = pulsing circle, neutral = hollow circle.

## Properties

| Property | Attribute | Description | Type                                                | Default     |
| -------- | --------- | ----------- | --------------------------------------------------- | ----------- |
| `tone`   | `tone`    |             | `"busy" \| "danger" \| "neutral" \| "ok" \| "warn"` | `'neutral'` |


## Slots

| Slot | Description                           |
| ---- | ------------------------------------- |
|      | The state as a word (always required) |


## Shadow Parts

| Part    | Description   |
| ------- | ------------- |
| `"dot"` | The indicator |


----------------------------------------------


