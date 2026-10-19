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
