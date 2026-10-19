# Sortable columns

A sortable header is `<th aria-sort="ascending|descending">` with a `<button>` inside; the table only styles it, your code sorts the rows. `compact` makes rows 30px instead of 36px.

```html
<kern-table compact>
  <table>
    <thead>
      <tr>
        <th aria-sort="ascending"><button data-key="name">Name</button></th>
        <th><button data-key="ip">IP</button></th>
        <th class="num"><button data-key="uptime">Uptime (h)</button></th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Bathroom fan</td><td class="mono">192.168.1.21</td><td class="num">99</td></tr>
      <tr><td>Kitchen light</td><td class="mono">192.168.1.34</td><td class="num">412</td></tr>
      <tr><td>Shutter south</td><td class="mono">192.168.1.52</td><td class="num">7</td></tr>
    </tbody>
  </table>
</kern-table>
```

```js
const tbody = root.querySelector('tbody');
const ths = [...root.querySelectorAll('th')];
for (const th of ths) {
  const button = th.querySelector('button');
  button.addEventListener('click', () => {
    const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
    ths.forEach((h) => h.removeAttribute('aria-sort'));
    th.setAttribute('aria-sort', dir);
    const col = ths.indexOf(th);
    const rows = [...tbody.rows].sort((a, b) =>
      a.cells[col].textContent.localeCompare(b.cells[col].textContent, undefined, { numeric: true }),
    );
    if (dir === 'descending') rows.reverse();
    tbody.append(...rows);
  });
}
```
