# Column state

In data mode `columnState` shows, hides, orders and pins columns by their `key`: `[{ key, hidden?, pinned? }]`, the array order is the column order. It is plain data, so an app can store it (see `kern-table-columns` and the table views pattern). Columns the state doesn't name keep their place in `columns`, unknown keys are ignored, so a state stored before a column was added or removed still works. Without a state the table uses `columns[].hidden` and `columns[].pinned`.

- `pinned: 'start' | 'end'` keeps a column in view while the table scrolls sideways. With columns pinned to the start, the selection and detail toggle columns stay in view before them.
- `minWidth` keeps a column from shrinking; the table scrolls sideways instead. `hideable: false` keeps a column always visible, `min-visible-columns` keeps at least that many.
- Rows, their keys, selection, open details, sorting (also by a hidden column) and the page stay when the state changes; cells move within their rows.

Own markup has no column state: render the columns you want yourself (e.g. with `@if` in Angular). Keys of header cells with `colspan`/`rowspan` would not name one column, so the table doesn't hide or move them.

```html
<kern-toolbar>
  <kern-button size="sm" class="diagnose">Diagnosis</kern-button>
  <kern-button size="sm" class="maintain">Maintenance</kern-button>
  <kern-button size="sm" variant="ghost" class="reset">Default</kern-button>
</kern-toolbar>
<div style="display:grid;gap:var(--space-3);max-width:560px">
  <kern-table selectable compact></kern-table>
  <pre class="state" style="margin:0;font:12px/18px var(--font-mono);color:var(--text-muted);white-space:pre-wrap"></pre>
</div>
```

```js
const table = root.querySelector('kern-table');
table.columns = [
  { key: 'name', label: 'Name', sortable: true, sorted: 'asc', hideable: false, pinned: 'start', minWidth: '140px' },
  { key: 'ip', label: 'IP', mono: true },
  { key: 'lastSeen', label: 'Last seen', sortable: true },
  { key: 'model', label: 'Model', minWidth: '160px' },
  { key: 'firmware', label: 'Firmware', mono: true, hidden: true },
  { key: 'update', label: 'Update', hidden: true },
  { key: 'site', label: 'Site', minWidth: '120px' },
  { key: 'power', label: 'Power (W)', sortable: true, align: 'end', pinned: 'end' },
];
table.rows = [
  { id: 'a1', name: 'Kitchen light', ip: '192.168.1.34', lastSeen: '2 min ago', model: 'Shelly 1 Mini Gen3', firmware: '1.4.4', update: '–', site: 'Haus Seeblick', power: 9 },
  { id: 'a2', name: 'Bathroom fan', ip: '192.168.1.21', lastSeen: '1 min ago', model: 'Shelly Plus 1PM', firmware: '1.4.2', update: '1.4.4', site: 'Haus Seeblick', power: 42 },
  { id: 'a3', name: 'Shutter south', ip: '192.168.1.52', lastSeen: '3 days ago', model: 'Shelly Plus 2PM', firmware: '1.3.3', update: '1.4.4', site: 'Ferienwohnung', power: null },
];
const show = (state) => {
  table.columnState = state;
  root.querySelector('.state').textContent = JSON.stringify(state ?? 'default');
};
root.querySelector('.diagnose').addEventListener('click', () =>
  show([{ key: 'name', pinned: 'start' }, { key: 'ip' }, { key: 'lastSeen' }, { key: 'model', hidden: true }, { key: 'site' }]),
);
root.querySelector('.maintain').addEventListener('click', () =>
  show([{ key: 'name', pinned: 'start' }, { key: 'firmware' }, { key: 'update' }, { key: 'model' }, { key: 'ip', hidden: true }, { key: 'lastSeen', hidden: true }]),
);
root.querySelector('.reset').addEventListener('click', () => show(undefined));
show(undefined);
```
