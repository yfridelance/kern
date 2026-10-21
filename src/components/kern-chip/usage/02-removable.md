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
