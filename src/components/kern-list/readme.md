# kern-list



<!-- Auto Generated Below -->


## Overview

List of rows (devices, settings, events): kern-list-item children, separated by lines, in a bordered box.
`flush` drops the box, e.g. inside kern-card. Shows `empty` when there are no items.

`variant="nav"` is a side navigation: compact rows without lines or box, rounded hover, and `current` on the
item of the open page. With `heading` the list gets a visible group title that also names it; several nav
lists in a row form groups.

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


### 03-navigation

# Navigation

`variant="nav"` turns the list into a side navigation: compact rows without lines or box and a rounded hover. `heading` adds a visible group title that also names the list; several nav lists in a row form groups. `current` marks the link to the open page with `aria-current="page"` (`selected` stays `aria-current="true"` for a chosen row in a normal list). Icons go into the `start` slot, counters into `meta` as `kern-badge mono`.

```html
<div style="width:240px">
  <kern-list variant="nav" heading="Home">
    <kern-list-item heading="Overview" href="#overview" current><kern-icon slot="start" name="home"></kern-icon></kern-list-item>
    <kern-list-item heading="Devices" href="#devices">
      <kern-icon slot="start" name="power"></kern-icon>
      <kern-badge slot="meta" mono>38</kern-badge>
    </kern-list-item>
    <kern-list-item heading="Lights" href="#lights"><kern-icon slot="start" name="bulb"></kern-icon></kern-list-item>
  </kern-list>
  <kern-list variant="nav" heading="System">
    <kern-list-item heading="Updates" href="#updates">
      <kern-icon slot="start" name="refresh"></kern-icon>
      <kern-badge slot="meta" mono tone="accent">3</kern-badge>
    </kern-list-item>
    <kern-list-item heading="Settings" href="#settings"><kern-icon slot="start" name="settings"></kern-icon></kern-list-item>
  </kern-list>
</div>
```

```js
// Demo only: move `current` instead of following the links.
root.addEventListener('kernNavigate', (e) => {
  e.preventDefault();
  for (const el of root.querySelectorAll('kern-list-item[current]')) el.current = false;
  e.target.current = true;
});
```



## Properties

| Property  | Attribute | Description                                                            | Type                  | Default     |
| --------- | --------- | ---------------------------------------------------------------------- | --------------------- | ----------- |
| `empty`   | `empty`   | Shown when there are no items; empty string shows nothing.             | `string \| undefined` | `undefined` |
| `flush`   | `flush`   | Without border and background, e.g. inside kern-card.                  | `boolean`             | `false`     |
| `heading` | `heading` | Visible group title above the rows; names the list instead of `label`. | `string \| undefined` | `undefined` |
| `label`   | `label`   | Accessible name of the list.                                           | `string \| undefined` | `undefined` |
| `size`    | `size`    | `sm` = denser rows.                                                    | `"md" \| "sm"`        | `'md'`      |
| `variant` | `variant` | `nav` = side navigation: compact rows without lines and box.           | `"default" \| "nav"`  | `'default'` |


## Slots

| Slot | Description             |
| ---- | ----------------------- |
|      | kern-list-item elements |


## Shadow Parts

| Part        | Description                  |
| ----------- | ---------------------------- |
| `"empty"`   | The text shown without items |
| `"heading"` | The group title              |
| `"list"`    | The list box                 |


----------------------------------------------


