# Controlled from outside

With `controlled="external"` the table does not touch the rows. A click on a sortable header (or `sortBy()`) only emits `kernSort` with `{ key, column, direction }`; your code loads or orders the data and sets `sorted` on the header. Use this when the server sorts, or when a framework renders the rows (Angular `@for`). `data-key` names a column, otherwise `key` is its index.

```html
<kern-table controlled="external">
  <table>
    <thead>
      <tr>
        <th sortable data-key="name">Name</th>
        <th sortable data-key="power" sorted="desc" class="num">Power (W)</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</kern-table>
```

```js
const devices = [
  { name: 'Bathroom fan', power: 42 },
  { name: 'Kitchen light', power: 9 },
  { name: 'Heat pump', power: 1840 },
];
const table = root.querySelector('kern-table');
const render = (key, direction) => {
  const sorted = [...devices].sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * (direction === 'asc' ? 1 : -1));
  root.querySelector('tbody').innerHTML = sorted.map((d) => `<tr><td>${d.name}</td><td class="num">${d.power}</td></tr>`).join('');
  root.querySelectorAll('th').forEach((th) => (th.dataset.key === key ? th.setAttribute('sorted', direction) : th.removeAttribute('sorted')));
};
table.addEventListener('kernSort', (ev) => render(ev.detail.key, ev.detail.direction));
render('power', 'desc');
```
