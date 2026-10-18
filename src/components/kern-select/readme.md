# kern-select



<!-- Auto Generated Below -->


## Overview

Labelled single choice with its own dropdown list, form-associated. Options come from the `options`
property or from child `<option>` elements (kept in sync, so `@for` / `*ngFor` over options works).
Elements in the `footer` slot appear below the list, e.g. a button "Standorte bearbeiten"; clicking
one closes the list.

Keyboard: Enter, Space or Arrow keys open; Arrow keys, Home, End and typing a letter move; Enter
or Space picks; Escape closes; Tab moves on to the footer.

## Properties

| Property        | Attribute         | Description                                      | Type                        | Default     |
| --------------- | ----------------- | ------------------------------------------------ | --------------------------- | ----------- |
| `ariaLabelText` | `aria-label-text` | Accessible name when there is no visible label.  | `string \| undefined`       | `undefined` |
| `disabled`      | `disabled`        |                                                  | `boolean`                   | `false`     |
| `error`         | `error`           |                                                  | `string \| undefined`       | `undefined` |
| `hint`          | `hint`            |                                                  | `string \| undefined`       | `undefined` |
| `label`         | `label`           |                                                  | `string \| undefined`       | `undefined` |
| `name`          | `name`            |                                                  | `string \| undefined`       | `undefined` |
| `options`       | --                | Takes precedence over child `<option>` elements. | `KernOption[] \| undefined` | `undefined` |
| `placeholder`   | `placeholder`     | Shown when no option is selected.                | `string \| undefined`       | `undefined` |
| `required`      | `required`        |                                                  | `boolean`                   | `false`     |
| `size`          | `size`            |                                                  | `"md" \| "sm"`              | `'md'`      |
| `value`         | `value`           |                                                  | `string`                    | `''`        |


## Events

| Event        | Description                    | Type                              |
| ------------ | ------------------------------ | --------------------------------- |
| `kernChange` | When the user picks an option. | `CustomEvent<{ value: string; }>` |


## Methods

### `hide() => Promise<void>`

Closes the dropdown.

#### Returns

Type: `Promise<void>`



### `setFocus() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`

Opens the dropdown.

#### Returns

Type: `Promise<void>`




## Slots

| Slot       | Description                                                    |
| ---------- | -------------------------------------------------------------- |
|            | `<option>` elements (read, not shown)                          |
| `"footer"` | Actions below the list (kern-button variant="ghost" size="sm") |


## Shadow Parts

| Part        | Description        |
| ----------- | ------------------ |
| `"control"` | The trigger button |
| `"listbox"` | The dropdown panel |
| `"option"`  | Each option        |


----------------------------------------------


