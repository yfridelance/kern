# Overview

Patterns show how several Kern components work together in typical admin screens: filtering a device list, empty and error states, bulk actions, long-running jobs, saved table views, and complete reference flows. They are recipes, not components. You copy the markup and adapt the script to your app.

Kern draws the interface; your app owns the rest:

- **Kern:** layout, controls, states (loading, empty, error), keyboard and screen-reader behaviour, translatable texts.
- **Your app:** data, API calls, filter and selection state, permissions, what an action does and whether it is allowed.

The examples run against `docs/assets/mock.js`, which provides fixed example devices and a pretend server with delays and errors. Nothing in it is part of Kern.

## A list loaded from a server

The table pages on the server (`controlled="external"`): on `kernPageChange` and `kernSort` the script asks the pretend server for one page and sets `rows`, `total` and `loading`. Every other pattern builds on this loop.

```html
<kern-table controlled="external" page-size="5" page-sizes="5,10,25"></kern-table>
```

```js
const { fakeServer } = await import('../assets/mock.js');
const server = fakeServer({ delay: 300 });
const table = root.querySelector('kern-table');
table.columns = [
  { key: 'name', label: 'Name', sortable: true, sorted: 'asc' },
  { key: 'site', label: 'Site', sortable: true },
  { key: 'ip', label: 'IP', mono: true },
  { key: 'firmware', label: 'Firmware', mono: true },
];
table.rowKey = (row) => row.id;
const state = { page: 1, pageSize: 5, sort: { key: 'name', direction: 'asc' } };
const load = async () => {
  table.loading = true;
  const { rows, total } = await server.query(state);
  Object.assign(table, { rows, total, page: state.page, loading: false });
};
table.addEventListener('kernPageChange', (e) => {
  Object.assign(state, e.detail);
  load();
});
table.addEventListener('kernSort', (e) => {
  state.sort = { key: e.detail.key, direction: e.detail.direction };
  state.page = 1;
  table.columns = table.columns.map((c) => ({ ...c, sorted: c.key === e.detail.key ? e.detail.direction : undefined }));
  load();
});
load();
```

## Writing a pattern page

Each page is a Markdown file in `docs/patterns/` named `NN-slug.md`. The number sets the order in the navigation. The page starts with a `#` title and an introduction. Every `##` section that follows becomes one live example with its own `html` and `js` blocks, just like the component examples. In the script, `root` is the example's container. `await import('../assets/mock.js')` loads the example data, and `await import('../kern/index.esm.js')` loads functions like `toast()` or `confirm()`.
