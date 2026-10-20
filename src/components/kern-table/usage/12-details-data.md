# Detail rows from data

In data mode `detail` returns the content of a row's detail row (a Node or text) and adds a first column with a chevron toggle. It is called when a row is opened for the first time. `label-expand-row` names the toggle for screen readers.

```html
<kern-table compact></kern-table>
```

```js
const table = root.querySelector('kern-table');
table.columns = [
  { key: 'time', label: 'Time', sortable: true, sorted: 'desc', mono: true },
  { key: 'device', label: 'Device', sortable: true },
  { key: 'message', label: 'Message' },
];
table.rows = [
  { id: 1, time: '14:02:11', device: 'Kitchen light', message: 'Firmware update finished', data: { from: '1.4.2', to: '1.5.0' } },
  { id: 2, time: '13:58:40', device: 'Shutter south', message: 'Connection lost', data: { rssi: -88, retries: 3 } },
  { id: 3, time: '13:12:05', device: 'Bathroom fan', message: 'Config changed', data: { eco: true } },
];
table.detail = (row) => Object.assign(document.createElement('kern-json'), { data: row.data });
```
