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

# Page size and English labels

`page-sizes` offers a page size choice; changing it keeps the first visible item on screen. `siblings` sets how many page numbers show around the current one. The built-in texts default to German; override them with the `label-*` attributes, where `{from}`, `{to}`, `{total}` and `{n}` are replaced.

```html
<kern-pagination
  total="38" page-size="10" page-sizes="10,25,50" siblings="2" locale="en"
  label="Pages" label-range="{from}–{to} of {total}" label-page-size="Per page" label-page="Page {n}"
  label-first="First page" label-previous="Previous page" label-next="Next page" label-last="Last page">
</kern-pagination>
```



## Properties

| Property        | Attribute         | Description                                                                      | Type                  | Default                     |
| --------------- | ----------------- | -------------------------------------------------------------------------------- | --------------------- | --------------------------- |
| `label`         | `label`           |                                                                                  | `string`              | `'Seiten'`                  |
| `labelFirst`    | `label-first`     |                                                                                  | `string`              | `'Erste Seite'`             |
| `labelLast`     | `label-last`      |                                                                                  | `string`              | `'Letzte Seite'`            |
| `labelNext`     | `label-next`      |                                                                                  | `string`              | `'Nächste Seite'`           |
| `labelPage`     | `label-page`      | `{n}` is replaced.                                                               | `string`              | `'Seite {n}'`               |
| `labelPageSize` | `label-page-size` |                                                                                  | `string`              | `'Pro Seite'`               |
| `labelPrevious` | `label-previous`  |                                                                                  | `string`              | `'Vorherige Seite'`         |
| `labelRange`    | `label-range`     | `{from}`, `{to}` and `{total}` are replaced.                                     | `string`              | `'{from}–{to} von {total}'` |
| `locale`        | `locale`          | BCP 47 locale for numbers; defaults to `<html lang>`, then the browser language. | `string \| undefined` | `undefined`                 |
| `page`          | `page`            | Current page, from 1.                                                            | `number`              | `1`                         |
| `pageSize`      | `page-size`       |                                                                                  | `number`              | `25`                        |
| `pageSizes`     | `page-sizes`      | Offered page sizes, e.g. `10,25,50,100`; empty hides the choice.                 | `number[] \| string`  | `''`                        |
| `siblings`      | `siblings`        | Page numbers on each side of the current one.                                    | `number`              | `1`                         |
| `total`         | `total`           | Number of items.                                                                 | `number`              | `0`                         |


## Events

| Event            | Description                    | Type                                               |
| ---------------- | ------------------------------ | -------------------------------------------------- |
| `kernPageChange` | The page or page size changed. | `CustomEvent<{ page: number; pageSize: number; }>` |


## Dependencies

### Depends on

- [kern-select](../kern-select)

### Graph
```mermaid
graph TD;
  kern-pagination --> kern-select
  style kern-pagination fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------


