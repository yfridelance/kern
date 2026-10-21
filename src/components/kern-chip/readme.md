# kern-chip



<!-- Auto Generated Below -->


## Overview

Compact pill for an active filter, a selected value or a tag. `removable` adds a × button (one tab stop per chip);
× or Delete/Backspace on it emits `kernRemove`. The chip does not remove itself: the app updates its state and
moves the focus, e.g. with `setFocus()` to the next chip or back to the search field.

## Usage

### 01-basic

# Tones and sizes

Chips show active filters, chosen values or tags as small pills. `tone` colours them like kern-badge; `size="sm"` fits dense rows and table cells. Use kern-badge for fixed properties and kern-status for device states.

```html
<div style="display:grid;gap:12px">
  <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
    <kern-chip>Haus Seeblick</kern-chip>
    <kern-chip tone="accent">Kitchen</kern-chip>
    <kern-chip tone="ok">online</kern-chip>
    <kern-chip tone="warn">update</kern-chip>
    <kern-chip tone="danger">offline</kern-chip>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
    <kern-chip size="sm">Shelly Plus 1PM</kern-chip>
    <kern-chip size="sm" tone="accent">Gen3</kern-chip>
    <kern-chip size="sm" removable>Büro Bern</kern-chip>
  </div>
</div>
```


### 02-removable

# Removable

`removable` adds a × button. Clicking it, or pressing Delete or Backspace while it has focus, emits `kernRemove` with `value` (the chip text when `value` is not set). The chip stays until the app removes it, and the app also decides where the focus goes next (`setFocus()` focuses the ×): here the next chip, else the previous one, else the button below. `label-remove` names the × for screen readers; `{label}` is replaced by the chip text.

```html
<div style="display:grid;gap:12px;justify-items:start">
  <div class="chips" style="display:flex;flex-wrap:wrap;gap:8px" aria-label="Active filters" role="group">
    <kern-chip removable tone="accent" value="site:Haus Seeblick">Site: Haus Seeblick</kern-chip>
    <kern-chip removable tone="accent" value="status:offline">Status: offline</kern-chip>
    <kern-chip removable tone="accent" value="search:kitchen" label-remove="Clear filter {label}">Search: kitchen</kern-chip>
  </div>
  <kern-button size="sm" variant="ghost">Restore filters</kern-button>
</div>
```

```js
const group = root.querySelector('.chips');
const restore = root.querySelector('kern-button');
const initial = group.innerHTML;
group.addEventListener('kernRemove', (e) => {
  const chip = e.target;
  const next = chip.nextElementSibling ?? chip.previousElementSibling;
  chip.remove();
  // Focus the × of the neighbour, or a sensible fallback when the last chip is gone.
  if (next) next.setFocus();
  else restore.focus();
});
restore.addEventListener('click', () => (group.innerHTML = initial));
```



## Properties

| Property      | Attribute      | Description                                                       | Type                                                  | Default     |
| ------------- | -------------- | ----------------------------------------------------------------- | ----------------------------------------------------- | ----------- |
| `labelRemove` | `label-remove` | Accessible name of the ×; `{label}` is replaced by the chip text. | `string \| undefined`                                 | `undefined` |
| `removable`   | `removable`    | Shows a × button that emits `kernRemove`.                         | `boolean`                                             | `false`     |
| `size`        | `size`         |                                                                   | `"md" \| "sm"`                                        | `'md'`      |
| `tone`        | `tone`         |                                                                   | `"accent" \| "danger" \| "neutral" \| "ok" \| "warn"` | `'neutral'` |
| `value`       | `value`        | Value sent with `kernRemove`; defaults to the chip text.          | `string \| undefined`                                 | `undefined` |


## Events

| Event        | Description                                  | Type                              |
| ------------ | -------------------------------------------- | --------------------------------- |
| `kernRemove` | × clicked or Delete/Backspace pressed on it. | `CustomEvent<{ value: string; }>` |


## Methods

### `setFocus() => Promise<void>`

Focuses the × (removable chips only), e.g. the next chip after one was removed.

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description |
| ---- | ----------- |
|      | Chip text   |


## Shadow Parts

| Part       | Description  |
| ---------- | ------------ |
| `"remove"` | The × button |


----------------------------------------------


