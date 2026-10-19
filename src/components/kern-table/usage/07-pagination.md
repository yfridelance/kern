# Pagination

`page-size` adds a `kern-pagination` below the rows; `page-sizes` offers other sizes. The table pages its rows itself, with data or with own markup, and goes back to page 1 after sorting. `kernPageChange` bubbles from the embedded pagination; set its labels on `table.querySelector('kern-pagination')`.

```html
<kern-table compact page-size="5" page-sizes="5,10,25"></kern-table>
```

```js
const table = root.querySelector('kern-table');
const rooms = ['Kitchen', 'Bathroom', 'Garage', 'Office', 'Bedroom', 'Hallway', 'Garden', 'Attic'];
const kinds = ['light', 'fan', 'shutter'];
table.columns = [
  { key: 'name', label: 'Name', sortable: true, sorted: 'asc' },
  { key: 'ip', label: 'IP', sortable: true, mono: true },
  { key: 'power', label: 'Power (W)', sortable: true, align: 'end' },
];
table.rows = Array.from({ length: 23 }, (_, i) => ({
  name: `${rooms[i % rooms.length]} ${kinds[i % kinds.length]}`,
  ip: `192.168.1.${20 + i}`,
  power: (i * 37) % 120,
}));
```
