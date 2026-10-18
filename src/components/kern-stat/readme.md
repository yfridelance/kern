# kern-stat



<!-- Auto Generated Below -->


## Overview

Key figure tile: label, large value with unit, optional change and a slot for a sparkline or meta text.
Group tiles in a grid (`repeat(auto-fit, minmax(180px, 1fr))`).

## Properties

| Property             | Attribute | Description                                                           | Type                          | Default     |
| -------------------- | --------- | --------------------------------------------------------------------- | ----------------------------- | ----------- |
| `delta`              | `delta`   | Change shown with an arrow, e.g. "2" or "+12 %".                      | `string \| undefined`         | `undefined` |
| `invert`             | `invert`  | When "more" is bad (errors, offline): up shows danger, down shows ok. | `boolean`                     | `false`     |
| `label` _(required)_ | `label`   |                                                                       | `string`                      | `undefined` |
| `meta`               | `meta`    | Text after the delta.                                                 | `string \| undefined`         | `undefined` |
| `trend`              | `trend`   | Direction of `delta`.                                                 | `"down" \| "up" \| undefined` | `undefined` |
| `unit`               | `unit`    |                                                                       | `string \| undefined`         | `undefined` |
| `value` _(required)_ | `value`   |                                                                       | `number \| string`            | `undefined` |


## Slots

| Slot | Description                                  |
| ---- | -------------------------------------------- |
|      | Below the value: kern-sparkline or meta text |


----------------------------------------------


