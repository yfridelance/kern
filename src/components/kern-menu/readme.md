# kern-menu



<!-- Auto Generated Below -->


## Overview

Action menu behind a trigger (e.g. a „⋯“ kern-button): kern-menu-item children, `<hr>` as separator. Opens on click,
Enter, Space or Arrow Down (Arrow Up starts at the end); Arrow keys, Home/End and letters move, Enter picks, Escape
or Tab closes. Picking emits `kernSelect` and returns the focus to the trigger.

## Properties

| Property | Attribute | Description                                                   | Type                  | Default     |
| -------- | --------- | ------------------------------------------------------------- | --------------------- | ----------- |
| `align`  | `align`   | Which edges line up with the trigger.                         | `"end" \| "start"`    | `'start'`   |
| `label`  | `label`   | Accessible name of the menu (defaults to the trigger's text). | `string \| undefined` | `undefined` |


## Events

| Event        | Description         | Type                              |
| ------------ | ------------------- | --------------------------------- |
| `kernSelect` | An item was picked. | `CustomEvent<{ value: string; }>` |


## Methods

### `hide() => Promise<void>`

Closes the menu.

#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`

Opens the menu and focuses the first item.

#### Returns

Type: `Promise<void>`




## Slots

| Slot        | Description                                   |
| ----------- | --------------------------------------------- |
|             | kern-menu-item elements and `<hr>` separators |
| `"trigger"` | The element that opens the menu               |


## Shadow Parts

| Part     | Description       |
| -------- | ----------------- |
| `"menu"` | The popover panel |


----------------------------------------------


