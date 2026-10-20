# kern-pagination



<!-- Auto Generated Below -->


## Overview

Paging for long tables and lists: range („1–25 von 380“), optional page size, first/previous, page numbers with
„…“, next/last. Emits `kernPageChange`; the app loads the page. Changing the page size keeps the first visible
item on screen.

## Usage

### 01-basic

# Paging a device table

Set `total` and `page-size`; the component shows the range, page numbers with „…“ and first/previous/next/last buttons. It only emits `kernPageChange` — the app loads the page.

```html
<kern-pagination total="380" page-size="25" page="3"></kern-pagination>
<p class="out" style="font-size:13px;color:var(--text-muted)">Pick a page.</p>
```

```js
root.querySelector('kern-pagination').addEventListener('kernPageChange', (e) => {
  root.querySelector('.out').textContent = `kernPageChange → ${JSON.stringify(e.detail)}`;
});
```


### 02-page-size

# Page size

`page-sizes` offers a page size choice; changing it keeps the first visible item on screen. `siblings` sets how many page numbers show around the current one. The texts follow the Kern language; the `label-*` attributes replace single ones, where `{from}`, `{to}`, `{total}` and `{n}` are replaced.

```html
<kern-pagination total="38" page-size="10" page-sizes="10,25,50" siblings="2" locale="en"></kern-pagination>
```



## Properties

| Property        | Attribute         | Description                                                                      | Type                  | Default     |
| --------------- | ----------------- | -------------------------------------------------------------------------------- | --------------------- | ----------- |
| `label`         | `label`           |                                                                                  | `string \| undefined` | `undefined` |
| `labelFirst`    | `label-first`     |                                                                                  | `string \| undefined` | `undefined` |
| `labelLast`     | `label-last`      |                                                                                  | `string \| undefined` | `undefined` |
| `labelNext`     | `label-next`      |                                                                                  | `string \| undefined` | `undefined` |
| `labelPage`     | `label-page`      | `{n}` is replaced.                                                               | `string \| undefined` | `undefined` |
| `labelPageSize` | `label-page-size` |                                                                                  | `string \| undefined` | `undefined` |
| `labelPrevious` | `label-previous`  |                                                                                  | `string \| undefined` | `undefined` |
| `labelRange`    | `label-range`     | `{from}`, `{to}` and `{total}` are replaced.                                     | `string \| undefined` | `undefined` |
| `locale`        | `locale`          | BCP 47 locale for numbers; defaults to `<html lang>`, then the browser language. | `string \| undefined` | `undefined` |
| `page`          | `page`            | Current page, from 1.                                                            | `number`              | `1`         |
| `pageSize`      | `page-size`       |                                                                                  | `number`              | `25`        |
| `pageSizes`     | `page-sizes`      | Offered page sizes, e.g. `10,25,50,100`; empty hides the choice.                 | `number[] \| string`  | `''`        |
| `siblings`      | `siblings`        | Page numbers on each side of the current one.                                    | `number`              | `1`         |
| `total`         | `total`           | Number of items.                                                                 | `number`              | `0`         |


## Events

| Event            | Description                    | Type                                               |
| ---------------- | ------------------------------ | -------------------------------------------------- |
| `kernPageChange` | The page or page size changed. | `CustomEvent<{ page: number; pageSize: number; }>` |


## Dependencies

### Used by

 - [kern-table](../kern-table)

### Depends on

- [kern-select](../kern-select)

### Graph
```mermaid
graph TD;
  kern-pagination --> kern-select
  kern-select --> kern-icon
  kern-table --> kern-pagination
  style kern-pagination fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------


