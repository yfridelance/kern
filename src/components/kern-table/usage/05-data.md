# Built from data

Set `columns` and `rows` and the table builds its own `<table>`; don't combine this with own markup. Each column reads `row[key]`; `cell` returns a Node (for components like `kern-signal`) or text, `sortValue` what to sort by. `getRowClass`, `getCellClass` and `getHeaderCellClass` add classes; `kernRowClick` reports clicks on a row (not on buttons or fields in it). Assign new arrays to update the table. Sorting, `controlled` and `sortBy()` work as with markup.

```html
<kern-table></kern-table>
<p class="last-click">Click a row.</p>
```

```js
const el = (tag, attrs, text) => Object.assign(document.createElement(tag), attrs, text ? { textContent: text } : {});
const table = root.querySelector('kern-table');
table.columns = [
  { key: 'name', label: 'Name', sortable: true, sorted: 'asc' },
  { key: 'ip', label: 'IP', sortable: true, mono: true },
  {
    key: 'rssi', label: 'Signal', sortable: true,
    cell: (d) => (d.rssi == null ? '–' : Object.assign(el('kern-signal'), { rssi: d.rssi, hideValue: true, label: 'Wi-Fi signal' })),
  },
  {
    key: 'online', label: 'Status',
    cell: (d) => Object.assign(el('kern-status', {}, d.online ? 'Active' : 'Missing'), { tone: d.online ? 'ok' : 'warn' }),
  },
  { key: 'power', label: 'Power (W)', sortable: true, align: 'end' },
];
table.rows = [
  { name: 'Kitchen light', ip: '192.168.1.34', rssi: -71, online: true, power: 9 },
  { name: 'Bathroom fan', ip: '192.168.1.21', rssi: -58, online: true, power: 42 },
  { name: 'Shutter south', ip: '192.168.1.52', rssi: -84, online: false, power: null },
  { name: 'Garage door', ip: null, rssi: null, online: false, power: null, reset: true },
];
table.getRowClass = (d) => (d.reset ? 'dim' : 'clickable');
table.addEventListener('kernRowClick', (ev) => {
  root.querySelector('.last-click').textContent = `Clicked: ${ev.detail.row.name}`;
});
```
