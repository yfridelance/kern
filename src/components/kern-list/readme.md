# kern-list



<!-- Auto Generated Below -->


## Overview

List of rows (devices, settings, events): kern-list-item children, separated by lines, in a bordered box.
`flush` drops the box, e.g. inside kern-card. Shows `empty` when there are no items.

## Usage

### 01-devices

# Device list

`kern-list` holds `kern-list-item` rows. With `href` a row is a link, with `clickable` a button that emits `kernItemClick`, and `selected` marks the current row. The `start` slot takes a status or icon, `meta` a right-aligned value, `end` actions that never trigger the row.

```html
<kern-list label="Devices">
  <kern-list-item heading="Bathroom fan" description="Plus 1PM · 192.168.1.21" href="#bathroom-fan" selected>
    <kern-status slot="start" tone="ok"></kern-status>
    <kern-date slot="meta" relative data-ago="45"></kern-date>
  </kern-list-item>
  <kern-list-item heading="Shutter south" description="Pro 2PM · unreachable since yesterday" clickable>
    <kern-status slot="start" tone="warn"></kern-status>
    <kern-date slot="meta" relative data-ago="93000"></kern-date>
    <kern-button slot="end" size="sm" variant="ghost">Search again</kern-button>
  </kern-list-item>
  <kern-list-item heading="Firmware 1.4.4 available" description="3 devices" meta="Stable">
    <kern-button slot="end" size="sm">Update</kern-button>
  </kern-list-item>
</kern-list>
<p class="out" style="color:var(--text-muted);font-size:13px"></p>
```

```js
for (const el of root.querySelectorAll('kern-date[data-ago]')) el.value = Date.now() - el.dataset.ago * 1000;
const out = root.querySelector('.out');
root.querySelector('kern-list-item[clickable]').addEventListener('kernItemClick', () => (out.textContent = 'kernItemClick → Shutter south'));
root.querySelector('kern-list-item[clickable] kern-button').addEventListener('click', () => (out.textContent = 'Search again clicked (row not triggered)'));
```


### 02-flush-empty

# Inside a card, empty

`flush` drops the list's own border and background, e.g. inside `kern-card`; `size="sm"` gives denser rows. Without items the list shows the `empty` text.

```html
<div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
  <kern-card heading="Events" flush>
    <kern-list flush size="sm" label="Events">
      <kern-list-item heading="Bathroom fan switched on" meta="09:41"></kern-list-item>
      <kern-list-item heading="Snapshot saved" meta="09:12"></kern-list-item>
      <kern-list-item heading="Kitchen light rebooted" meta="08:03"></kern-list-item>
    </kern-list>
  </kern-card>
  <kern-card heading="Notifications" flush>
    <kern-list flush size="sm" empty="No notifications"></kern-list>
  </kern-card>
</div>
```



## Properties

| Property | Attribute | Description                                                | Type                  | Default     |
| -------- | --------- | ---------------------------------------------------------- | --------------------- | ----------- |
| `empty`  | `empty`   | Shown when there are no items; empty string shows nothing. | `string \| undefined` | `undefined` |
| `flush`  | `flush`   | Without border and background, e.g. inside kern-card.      | `boolean`             | `false`     |
| `label`  | `label`   | Accessible name of the list.                               | `string \| undefined` | `undefined` |
| `size`   | `size`    | `sm` = denser rows.                                        | `"md" \| "sm"`        | `'md'`      |


## Slots

| Slot | Description             |
| ---- | ----------------------- |
|      | kern-list-item elements |


## Shadow Parts

| Part      | Description                  |
| --------- | ---------------------------- |
| `"empty"` | The text shown without items |
| `"list"`  | The list box                 |


----------------------------------------------


