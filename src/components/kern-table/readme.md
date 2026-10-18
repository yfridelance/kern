# kern-table



<!-- Auto Generated Below -->


## Overview

Dense data table: wraps a native `<table>` (light DOM, so cells can hold any markup and Angular bindings).
Sortable column: `<th aria-sort="ascending|descending"><button>…</button></th>`.
Cells: `class="mono"` (IP, MAC, IDs), `class="num"` (right-aligned figures).
Rows: `class="clickable"`, `aria-selected="true"`, `class="dim"` (reset/inactive).
Empty state: `<td colspan="…" class="empty">`.

## Properties

| Property  | Attribute | Description                | Type      | Default |
| --------- | --------- | -------------------------- | --------- | ------- |
| `compact` | `compact` | 30px rows instead of 36px. | `boolean` | `false` |


## Slots

| Slot | Description        |
| ---- | ------------------ |
|      | A native `<table>` |


----------------------------------------------


