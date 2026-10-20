# Selectable rows

`selectable` adds a first column with a checkbox per row. The header checkbox selects or clears the visible rows of the current page and shows a mixed state when only some of them are selected. Rows are identified by `data-key` on the `<tr>`; `selected` holds the keys and survives sorting, paging and new rows, and selected rows get `aria-selected="true"`. `kernSelectionChange` reports the new keys (cancel it to keep `selected` as it is). A click on a checkbox is no row click. `label-select-all` and `label-select-row` name the checkboxes for screen readers.

```html
<kern-table selectable compact page-size="3">
  <table>
    <thead>
      <tr><th sortable sorted="asc">Name</th><th sortable>IP</th><th sortable class="num">Power (W)</th></tr>
    </thead>
    <tbody>
      <tr data-key="A4CF12F45B21"><td>Kitchen light</td><td class="mono">192.168.1.34</td><td class="num">9</td></tr>
      <tr data-key="C82B961A3F00"><td>Bathroom fan</td><td class="mono">192.168.1.21</td><td class="num">42</td></tr>
      <tr data-key="34987A6E01C4"><td>Shutter south</td><td class="mono">192.168.1.52</td><td class="num">3</td></tr>
      <tr data-key="E86BEA112B90"><td>Garage door</td><td class="mono">192.168.1.9</td><td class="num">0</td></tr>
      <tr data-key="B0A73291C5E8"><td>Office plug</td><td class="mono">192.168.1.61</td><td class="num">120</td></tr>
    </tbody>
  </table>
</kern-table>
<p class="selection">No devices selected.</p>
```

```js
root.querySelector('kern-table').addEventListener('kernSelectionChange', (ev) => {
  const n = ev.detail.selected.length;
  root.querySelector('.selection').textContent = n ? `${n} selected: ${ev.detail.selected.join(', ')}` : 'No devices selected.';
});
```
