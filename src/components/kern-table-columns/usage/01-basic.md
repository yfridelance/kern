# Choose and order columns

`kern-table-columns` edits a column state for a `kern-table` in data mode: a checkbox per column shows or hides it, the arrow buttons (or Alt+↑/↓ anywhere in its row) move it. The focus stays on the button pressed, and the new position is announced. Pinned columns are marked and move within their group; columns with `hideable: false` and the last `min-visible-columns` can't be hidden. Give it the table's `columns` and set the state it reports with `kernColumnsChange` on the table; storing it is up to the app.

```html
<div style="display:flex;flex-wrap:wrap;gap:var(--space-4);align-items:flex-start">
  <kern-card heading="Columns" style="flex:0 1 280px">
    <kern-table-columns min-visible-columns="2"></kern-table-columns>
  </kern-card>
  <kern-table compact style="flex:1 1 320px;min-width:0"></kern-table>
</div>
```

```js
const table = root.querySelector('kern-table');
const picker = root.querySelector('kern-table-columns');
const columns = [
  { key: 'name', label: 'Name', sortable: true, sorted: 'asc', hideable: false, pinned: 'start' },
  { key: 'ip', label: 'IP', mono: true },
  { key: 'firmware', label: 'Firmware', mono: true },
  { key: 'status', label: 'Status' },
  { key: 'site', label: 'Site', hidden: true },
];
table.columns = picker.columns = columns;
table.rows = [
  { id: 1, name: 'Kitchen light', ip: '192.168.1.34', firmware: '1.4.4', status: 'online', site: 'Haus Seeblick' },
  { id: 2, name: 'Bathroom fan', ip: '192.168.1.21', firmware: '1.4.2', status: 'update', site: 'Haus Seeblick' },
  { id: 3, name: 'Shutter south', ip: '192.168.1.52', firmware: '1.3.3', status: 'offline', site: 'Ferienwohnung' },
];
picker.addEventListener('kernColumnsChange', (e) => {
  table.columnState = e.detail.state;
});
```
