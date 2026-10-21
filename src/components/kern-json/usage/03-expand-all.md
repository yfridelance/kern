# Expand all / Collapse all

`expandAll()`, `collapseAll()` and `setOpenDepth(depth)` open or close every node to a depth, also nodes toggled by hand and also when the depth is already set. Setting `openDepth` resets hand toggles the same way when the value changes.

```html
<div style="display:flex;gap:8px;margin-bottom:8px">
  <kern-button size="sm" variant="ghost" class="expand">Expand all</kern-button>
  <kern-button size="sm" variant="ghost" class="collapse">Collapse all</kern-button>
  <kern-button size="sm" variant="ghost" class="reset">Depth 1</kern-button>
</div>
<kern-json open-depth="1"></kern-json>
```

```js
const json = root.querySelector('kern-json');
json.data = {
  sys: { device: { name: 'Boiler', mac: 'C82B961A3F00', fw_id: '20240819-074343/1.4.2' }, location: { tz: 'Europe/Zurich', lat: 47.37, lon: 8.54 } },
  wifi: { sta: { ssid: 'Home', ipv4mode: 'dhcp' }, ap: { enable: false } },
  switch: [{ id: 0, name: 'Heater', initial_state: 'off', power_limit: 2500 }],
};
root.querySelector('.expand').addEventListener('click', () => json.expandAll());
root.querySelector('.collapse').addEventListener('click', () => json.collapseAll());
root.querySelector('.reset').addEventListener('click', () => json.setOpenDepth(1));
```
