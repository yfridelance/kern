# kern-card



<!-- Auto Generated Below -->


## Overview

Surface for one block of related content. Border, no shadow; no cards inside cards.

## Properties

| Property       | Attribute       | Description                                          | Type                  | Default     |
| -------------- | --------------- | ---------------------------------------------------- | --------------------- | ----------- |
| `flush`        | `flush`         | Body without padding (tables, lists up to the edge). | `boolean`             | `false`     |
| `heading`      | `heading`       |                                                      | `string \| undefined` | `undefined` |
| `headingLevel` | `heading-level` | Heading level for the document outline.              | `2 \| 3 \| 4`         | `2`         |


## Slots

| Slot        | Description                              |
| ----------- | ---------------------------------------- |
|             | Body                                     |
| `"actions"` | Small buttons on the right of the header |
| `"footer"`  | Form actions, right-aligned              |
| `"meta"`    | Next to the heading (badge, subtitle)    |


## Shadow Parts

| Part       | Description |
| ---------- | ----------- |
| `"body"`   | Body        |
| `"header"` | Header row  |


----------------------------------------------


