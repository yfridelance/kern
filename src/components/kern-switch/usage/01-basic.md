# Settings switches

The slotted text names the setting ("Cloud"), not the action. Space toggles; the form gets `value` (default `on`) under `name` only while checked.

```html
<div style="display:grid;gap:12px">
  <kern-switch name="cloud" checked>Cloud</kern-switch>
  <kern-switch name="ble">Bluetooth</kern-switch>
  <kern-switch name="mqtt" checked disabled>MQTT (managed by Home Assistant)</kern-switch>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
const out = root.querySelector('output');
for (const el of root.querySelectorAll('kern-switch')) {
  el.addEventListener('kernChange', (e) => (out.textContent = `kernChange → ${el.name}: ${e.detail.checked}`));
}
```
