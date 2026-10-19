# kern-list



<!-- Auto Generated Below -->


## Overview

List of rows (devices, settings, events): kern-list-item children, separated by lines, in a bordered box.
`flush` drops the box, e.g. inside kern-card. Shows `empty` when there are no items.

## Properties

| Property | Attribute | Description                                                | Type                  | Default            |
| -------- | --------- | ---------------------------------------------------------- | --------------------- | ------------------ |
| `empty`  | `empty`   | Shown when there are no items; empty string shows nothing. | `string`              | `'Keine Einträge'` |
| `flush`  | `flush`   | Without border and background, e.g. inside kern-card.      | `boolean`             | `false`            |
| `label`  | `label`   | Accessible name of the list.                               | `string \| undefined` | `undefined`        |
| `size`   | `size`    | `sm` = denser rows.                                        | `"md" \| "sm"`        | `'md'`             |


## Slots

| Slot | Description             |
| ---- | ----------------------- |
|      | kern-list-item elements |


## Shadow Parts

| Part      | Description                  |
| --------- | ---------------------------- |
| `"empty"` | The text shown without items |
| `"list"`  | The list box                 |


----------------------------------------------


