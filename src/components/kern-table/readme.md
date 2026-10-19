# kern-table



<!-- Auto Generated Below -->


## Overview

Dense data table: wraps a native `<table>` (light DOM, so cells can hold any markup and Angular bindings).
Sortable column: `<th aria-sort="ascending|descending"><button>…</button></th>`.
Cells: `class="mono"` (IP, MAC, IDs), `class="num"` (right-aligned figures).
Rows: `class="clickable"`, `aria-selected="true"`, `class="dim"` (reset/inactive).
Empty state: `<td colspan="…" class="empty">`.

## Usage

### 01-device-table

# Device table

`kern-table` wraps a native `<table>` in the light DOM, so cells can hold any markup. Use `class="mono"` for IPs, MACs and IDs, `class="num"` for right-aligned figures, and `class="clickable"`, `aria-selected="true"` or `class="dim"` on rows.

```html
<kern-table>
  <table>
    <thead>
      <tr><th>Name</th><th>Model</th><th>IP</th><th>MAC</th><th>Signal</th><th>Status</th><th class="num">Power</th></tr>
    </thead>
    <tbody>
      <tr class="clickable">
        <td>Bathroom fan</td><td>Plus 1PM</td>
        <td class="mono">192.168.1.21</td>
        <td class="mono"><kern-copy>C82B961A3F00</kern-copy></td>
        <td><kern-signal rssi="-58" hide-value label="Wi-Fi signal"></kern-signal></td>
        <td><kern-status tone="ok">Active</kern-status></td>
        <td class="num">42 W</td>
      </tr>
      <tr class="clickable" aria-selected="true">
        <td>Kitchen light <kern-badge tone="warn">Update</kern-badge></td><td>Shelly 1</td>
        <td class="mono">192.168.1.34</td>
        <td class="mono"><kern-copy>A4CF12F45B21</kern-copy></td>
        <td><kern-signal rssi="-71" hide-value label="Wi-Fi signal"></kern-signal></td>
        <td><kern-status tone="ok">Active</kern-status></td>
        <td class="num">9 W</td>
      </tr>
      <tr class="clickable">
        <td>Shutter south</td><td>Pro 2PM</td>
        <td class="mono">192.168.1.52</td>
        <td class="mono"><kern-copy>34987A6E01C4</kern-copy></td>
        <td><kern-signal rssi="-84" hide-value label="Wi-Fi signal"></kern-signal></td>
        <td><kern-status tone="warn">Missing</kern-status></td>
        <td class="num">–</td>
      </tr>
      <tr class="dim">
        <td>Garage door</td><td>Plus Uni</td>
        <td class="mono">–</td>
        <td class="mono">E86BEA112B90</td>
        <td>–</td>
        <td><kern-status>Reset</kern-status></td>
        <td class="num">–</td>
      </tr>
    </tbody>
  </table>
</kern-table>
```


### 02-sortable

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


### 03-empty

# Empty state

When a filter matches nothing, render a single cell spanning all columns with `class="empty"`.

```html
<kern-table>
  <table>
    <thead>
      <tr><th>Name</th><th>IP</th><th>Status</th></tr>
    </thead>
    <tbody>
      <tr><td colspan="3" class="empty">No devices match “garage”.</td></tr>
    </tbody>
  </table>
</kern-table>
```



## Properties

| Property  | Attribute | Description                | Type      | Default |
| --------- | --------- | -------------------------- | --------- | ------- |
| `compact` | `compact` | 30px rows instead of 36px. | `boolean` | `false` |


## Slots

| Slot | Description        |
| ---- | ------------------ |
|      | A native `<table>` |


----------------------------------------------


