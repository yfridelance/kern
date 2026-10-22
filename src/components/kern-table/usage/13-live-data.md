# Live data

New `rows` don't rebuild the table: rows are kept per key (`rowKey`, else `row.id`) and moved into the new order, and only cells whose text or class changed are touched. A focused button in a cell, selected text, open detail rows and their scroll position survive updates, even several per second. Rows that are no longer shown (removed, filtered, on another page) are dropped with their nodes.

`cell` is called on every update. Its third argument is the Node the cell shows now: change it and return it to keep it, or return a new Node to replace it. Text is only written when it changed. `detail` is called once, when a row is opened; update its content yourself. Here the progress bars and buttons are created once per row. Sort by progress and focus a button: the rows move every second, the button keeps the focus and the open log its scroll position.

```html
<kern-table compact></kern-table>
```

```js
const el = (tag, props) => Object.assign(document.createElement(tag), props);
const table = root.querySelector('kern-table');
let jobs = [
  { id: 'k', name: 'Kitchen light', progress: 12 },
  { id: 'b', name: 'Bathroom fan', progress: 48 },
  { id: 's', name: 'Shutter south', progress: 73 },
];
table.columns = [
  { key: 'name', label: 'Device', sortable: true },
  {
    key: 'progress', label: 'Progress', sortable: true, width: '40%',
    // Created once per row, then only its value changes.
    cell: (job, _i, bar = el('kern-progress', { label: job.name })) => Object.assign(bar, { value: job.progress, valueText: `${job.progress} %` }),
  },
  {
    key: 'action', label: 'Action',
    // The same button on every update: it keeps the focus while its row moves.
    cell: (job, _i, button = el('kern-button', { size: 'sm', textContent: 'Restart' })) => button,
  },
];
table.detail = (job) => el('kern-code', { heading: 'Log', maxHeight: '120px', code: Array.from({ length: 20 }, (_, i) => `${job.name}: step ${i + 1}`).join('\n') });
table.rows = jobs;

const timer = setInterval(() => {
  if (!table.isConnected) return clearInterval(timer);
  jobs = jobs.map((job) => ({ ...job, progress: job.progress >= 100 ? 0 : Math.min(100, job.progress + Math.ceil(Math.random() * 6)) }));
  table.rows = jobs;
}, 1000);
```
