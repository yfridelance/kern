# kern-copy



<!-- Auto Generated Below -->


## Overview

Technical value in monospace with a copy button (MAC, IP, device ID, commands).
The button stops click propagation so a clickable table row does not open.

## Properties

| Property | Attribute | Description                                 | Type                  | Default      |
| -------- | --------- | ------------------------------------------- | --------------------- | ------------ |
| `label`  | `label`   | Tooltip and accessible label of the button. | `string`              | `'Kopieren'` |
| `value`  | `value`   | Copied text; defaults to the text content.  | `string \| undefined` | `undefined`  |


## Events

| Event      | Description              | Type                              |
| ---------- | ------------------------ | --------------------------------- |
| `kernCopy` | After a successful copy. | `CustomEvent<{ value: string; }>` |


## Slots

| Slot | Description                          |
| ---- | ------------------------------------ |
|      | Displayed text (defaults to `value`) |


## Shadow Parts

| Part       | Description     |
| ---------- | --------------- |
| `"button"` | The copy button |


----------------------------------------------


