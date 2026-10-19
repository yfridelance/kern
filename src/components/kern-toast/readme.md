# kern-toast



<!-- Auto Generated Below -->


## Overview

Short, non-blocking feedback after an action („Snapshot gespeichert“). Usually created with `toast()`, which stacks
them at the bottom right. Closes itself after `duration` (paused while hovered or focused), with the × or the
optional action. `toast()` announces it through a polite live region; `danger` interrupts as an alert.

## Properties

| Property      | Attribute      | Description                                                   | Type                                                | Default        |
| ------------- | -------------- | ------------------------------------------------------------- | --------------------------------------------------- | -------------- |
| `actionLabel` | `action-label` | Text of an optional action, e.g. „Rückgängig“.                | `string \| undefined`                               | `undefined`    |
| `closeLabel`  | `close-label`  |                                                               | `string`                                            | `'Schliessen'` |
| `duration`    | `duration`     | Milliseconds until it closes itself; 0 keeps it until closed. | `number`                                            | `5000`         |
| `heading`     | `heading`      |                                                               | `string \| undefined`                               | `undefined`    |
| `tone`        | `tone`         |                                                               | `"danger" \| "info" \| "neutral" \| "ok" \| "warn"` | `'neutral'`    |


## Events

| Event        | Description                                     | Type                                        |
| ------------ | ----------------------------------------------- | ------------------------------------------- |
| `kernAction` | The action was clicked (the toast then closes). | `CustomEvent<void>`                         |
| `kernClose`  | The toast closed; `reason` says why.            | `CustomEvent<{ reason: KernToastReason; }>` |


## Methods

### `close(reason?: KernToastReason) => Promise<void>`

Closes the toast.

#### Parameters

| Name     | Type                               | Description |
| -------- | ---------------------------------- | ----------- |
| `reason` | `"close" \| "timeout" \| "action"` |             |

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description  |
| ---- | ------------ |
|      | Message text |


## Shadow Parts

| Part       | Description       |
| ---------- | ----------------- |
| `"action"` | The action button |


----------------------------------------------


