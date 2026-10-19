# Select all with indeterminate

`indeterminate` shows the mixed state, e.g. when some devices are selected; it is cleared on user input. Without visible text, set `label` as the accessible name.

```html
<div style="display:grid;gap:8px">
  <kern-checkbox class="all">All devices</kern-checkbox>
  <div style="display:grid;gap:8px;padding-left:24px">
    <kern-checkbox class="one" name="device" value="kitchen" checked>Kitchen Light</kern-checkbox>
    <kern-checkbox class="one" name="device" value="fan">Bathroom Fan</kern-checkbox>
    <kern-checkbox class="one" name="device" value="garage">Garage Door</kern-checkbox>
  </div>
</div>
```

```js
const all = root.querySelector('.all');
const items = [...root.querySelectorAll('.one')];
const sync = () => {
  const n = items.filter((i) => i.checked).length;
  all.checked = n === items.length;
  all.indeterminate = n > 0 && n < items.length;
};
all.addEventListener('kernChange', (e) => items.forEach((i) => (i.checked = e.detail.checked)));
items.forEach((i) => i.addEventListener('kernChange', sync));
sync();
```
