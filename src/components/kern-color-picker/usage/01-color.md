# Light colour

`mode="color"` (default): `value` is `#rrggbb`. The popover has a saturation/brightness area, a hue bar and `swatches`. The hex text can be typed (Enter or leaving applies it). Area and bar work with the arrow keys; Shift takes larger steps.

```html
<div style="display:grid;gap:16px;max-width:280px">
  <kern-color-picker name="color" label="Light colour" value="#3cc8cc" swatches="#ff8a3c,#ffd23c,#3cc8cc,#7fa8ff,#e58bbf,#ffffff"></kern-color-picker>
  <kern-color-picker label="Status LED" value="#ff8a3c" size="sm" disabled></kern-color-picker>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
const picker = root.querySelector('kern-color-picker');
const out = root.querySelector('output');
picker.addEventListener('kernInput', (e) => (out.textContent = 'kernInput → ' + e.detail.value));
picker.addEventListener('kernChange', (e) => (out.textContent = 'kernChange → ' + e.detail.value));
```
