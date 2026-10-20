# Selectable rows from data

In data mode `rowKey` returns a row's key (default: `row.id`, else its index in `rows`). Set `selected` to select rows from the app, e.g. for a bulk action like “only devices with changes”; the table keeps keys of rows that are filtered out.

```html
<kern-toolbar>
  <kern-button size="sm" class="updates">Only with update</kern-button>
  <kern-button size="sm" variant="ghost" class="none">None</kern-button>
  <span class="count" slot="end">0 selected</span>
</kern-toolbar>
<kern-table selectable compact label-select-all="Select all" label-select-row="Select row"></kern-table>
```

```js
const table = root.querySelector('kern-table');
const devices = [
  { mac: 'A4CF12F45B21', name: 'Kitchen light', firmware: '1.4.2', update: true },
  { mac: 'C82B961A3F00', name: 'Bathroom fan', firmware: '1.5.0', update: false },
  { mac: '34987A6E01C4', name: 'Shutter south', firmware: '1.3.9', update: true },
  { mac: 'E86BEA112B90', name: 'Garage door', firmware: '1.5.0', update: false },
];
table.columns = [
  { key: 'name', label: 'Name', sortable: true, sorted: 'asc' },
  { key: 'mac', label: 'MAC', mono: true },
  { key: 'firmware', label: 'Firmware', sortable: true, mono: true },
];
table.rows = devices;
table.rowKey = (d) => d.mac;
const select = (keys) => {
  table.selected = keys;
  root.querySelector('.count').textContent = `${keys.length} selected`;
};
table.addEventListener('kernSelectionChange', (ev) => select(ev.detail.selected));
root.querySelector('.updates').addEventListener('click', () => select(devices.filter((d) => d.update).map((d) => d.mac)));
root.querySelector('.none').addEventListener('click', () => select([]));
```
