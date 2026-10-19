# kern-list-item



<!-- Auto Generated Below -->


## Overview

One row of kern-list: optional icon or status at the start, heading and description, meta text (e.g. a time) and
actions at the end. With `href` the row is a link, with `clickable` a button (`kernItemClick`); actions in the
`end` slot sit beside it, so clicking them never triggers the row.

## Properties

| Property      | Attribute     | Description                                             | Type                  | Default     |
| ------------- | ------------- | ------------------------------------------------------- | --------------------- | ----------- |
| `clickable`   | `clickable`   | Turns the row into a button that emits `kernItemClick`. | `boolean`             | `false`     |
| `description` | `description` |                                                         | `string \| undefined` | `undefined` |
| `disabled`    | `disabled`    |                                                         | `boolean`             | `false`     |
| `heading`     | `heading`     |                                                         | `string \| undefined` | `undefined` |
| `href`        | `href`        | Turns the row into a link.                              | `string \| undefined` | `undefined` |
| `meta`        | `meta`        | Right-aligned, muted (time, count, size).               | `string \| undefined` | `undefined` |
| `selected`    | `selected`    | Marks the current row (`aria-current`).                 | `boolean`             | `false`     |
| `target`      | `target`      |                                                         | `string \| undefined` | `undefined` |


## Events

| Event           | Description                                | Type                |
| --------------- | ------------------------------------------ | ------------------- |
| `kernItemClick` | Click or Enter/Space on a `clickable` row. | `CustomEvent<void>` |


## Slots

| Slot            | Description                                                     |
| --------------- | --------------------------------------------------------------- |
|                 | Heading (instead of `heading`)                                  |
| `"description"` | Second line (instead of `description`)                          |
| `"end"`         | Actions, e.g. kern-button size="sm" variant="ghost"             |
| `"meta"`        | Right-aligned meta, e.g. kern-date relative (instead of `meta`) |
| `"start"`       | Icon, kern-status or avatar                                     |


## Shadow Parts

| Part    | Description                   |
| ------- | ----------------------------- |
| `"row"` | The link, button or plain row |


----------------------------------------------


