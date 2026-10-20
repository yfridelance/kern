# Detail rows

A `<tr kern-details>` right after a row is its detail row: hidden until the row is expanded, spanning all columns (the selection column, too). It moves with its row when sorting, doesn't count as a row for paging and hides with its row. A `<button kern-expand>` in the row toggles it; the table sets `aria-expanded` and `aria-controls`. `expanded` holds the keys of the open rows (`data-key`), `kernRowToggle` reports `{ key, open }` (cancel it to keep `expanded`), and `toggleRow(key, open?)` opens or closes a row from the app.

```html
<kern-table selectable compact page-size="3" label-select-all="Select all" label-select-row="Select row">
  <table>
    <thead>
      <tr><th sortable sorted="asc">Device</th><th sortable class="num">Changes</th><th>Template</th></tr>
    </thead>
    <tbody>
      <tr data-key="A4CF12F45B21">
        <td>Kitchen light</td><td class="num">2</td>
        <td><button kern-expand>Preview <kern-icon name="chevron-right"></kern-icon></button></td>
      </tr>
      <tr kern-details><td>
        <kern-kv>
          <kern-kv-item label="Wi-Fi AP">on → off</kern-kv-item>
          <kern-kv-item label="Eco mode">off → on</kern-kv-item>
        </kern-kv>
      </td></tr>
      <tr data-key="C82B961A3F00">
        <td>Bathroom fan</td><td class="num">0</td><td>–</td>
      </tr>
      <tr data-key="34987A6E01C4">
        <td>Shutter south</td><td class="num">1</td>
        <td><button kern-expand>Preview <kern-icon name="chevron-right"></kern-icon></button></td>
      </tr>
      <tr kern-details><td>
        <kern-kv><kern-kv-item label="Cloud">on → off</kern-kv-item></kern-kv>
      </td></tr>
      <tr data-key="B0A73291C5E8">
        <td>Office plug</td><td class="num">3</td>
        <td><button kern-expand>Preview <kern-icon name="chevron-right"></kern-icon></button></td>
      </tr>
      <tr kern-details><td>
        <kern-kv>
          <kern-kv-item label="Name">Plug → Office plug</kern-kv-item>
          <kern-kv-item label="Power on">last → off</kern-kv-item>
          <kern-kv-item label="Cloud">on → off</kern-kv-item>
        </kern-kv>
      </td></tr>
    </tbody>
  </table>
</kern-table>
<p><kern-button size="sm" class="all">Open all</kern-button></p>
```

```js
const table = root.querySelector('kern-table');
root.querySelector('.all').addEventListener('click', () => {
  table.expanded = ['A4CF12F45B21', '34987A6E01C4', 'B0A73291C5E8'];
});
```
