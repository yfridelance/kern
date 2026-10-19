# Page size and English labels

`page-sizes` offers a page size choice; changing it keeps the first visible item on screen. `siblings` sets how many page numbers show around the current one. The built-in texts default to German; override them with the `label-*` attributes, where `{from}`, `{to}`, `{total}` and `{n}` are replaced.

```html
<kern-pagination
  total="38" page-size="10" page-sizes="10,25,50" siblings="2" locale="en"
  label="Pages" label-range="{from}–{to} of {total}" label-page-size="Per page" label-page="Page {n}"
  label-first="First page" label-previous="Previous page" label-next="Next page" label-last="Last page">
</kern-pagination>
```
