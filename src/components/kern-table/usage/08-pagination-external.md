# Paging on the server

With `controlled="external"` the table shows the rows it gets and only reports `kernPageChange` and `kernSort`. Your code loads the page and sets `rows`, `total` and `page` (usually back to 1 after sorting). Here a timeout stands in for the server.

```html
<kern-table controlled="external" page-size="5" page-sizes="5,10"></kern-table>
```

```js
const table = root.querySelector('kern-table');
const all = Array.from({ length: 42 }, (_, i) => ({ id: `SH-${String(i + 1).padStart(3, '0')}`, uptime: (i * 53) % 900 }));
const state = { page: 1, pageSize: 5, key: 'id', direction: 'asc' };
const columns = () => [
  { key: 'id', label: 'Device ID', sortable: true, mono: true },
  { key: 'uptime', label: 'Uptime (h)', sortable: true, align: 'end' },
].map((c) => ({ ...c, sorted: c.key === state.key ? state.direction : undefined }));

const load = () => {
  table.loading = true;
  setTimeout(() => {
    // “Server”: sort, then cut the page
    const sign = state.direction === 'asc' ? 1 : -1;
    const sorted = [...all].sort((a, b) => (a[state.key] > b[state.key] ? 1 : a[state.key] < b[state.key] ? -1 : 0) * sign);
    const start = (state.page - 1) * state.pageSize;
    table.columns = columns();
    table.total = all.length;
    table.page = state.page;
    table.rows = sorted.slice(start, start + state.pageSize);
    table.loading = false;
  }, 400);
};
table.addEventListener('kernPageChange', (ev) => {
  Object.assign(state, ev.detail);
  load();
});
table.addEventListener('kernSort', (ev) => {
  Object.assign(state, { key: ev.detail.key, direction: ev.detail.direction, page: 1 });
  load();
});
load();
```
