# Loading

`loading` dims the content, shows a bar under the header and sets `aria-busy`. In data mode without rows it shows `loading-rows` skeleton rows instead; `label-empty` is the text for empty data. `loading` works with markup too.

```html
<kern-button>Reload</kern-button>
<kern-table loading></kern-table>
```

```js
const table = root.querySelector('kern-table');
const data = [
  { name: 'Kitchen light', uptime: 412 },
  { name: 'Bathroom fan', uptime: 99 },
];
table.columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'uptime', label: 'Uptime (h)', sortable: true, align: 'end' },
];
table.rows = [];
const load = () => {
  table.loading = true;
  setTimeout(() => {
    table.rows = data.map((d) => ({ ...d, uptime: d.uptime + Math.floor(Math.random() * 5) }));
    table.loading = false;
  }, 1500);
};
root.querySelector('kern-button').addEventListener('click', load);
load();
```
