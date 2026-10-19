# Number with steps

`value` is a number, limited to `min`/`max` and rounded to the decimals of `step`; `unit` follows the number. The field accepts the locale's decimal comma. Keyboard: Arrow Up/Down ± `step`, Page Up/Down ± 10 × `step`, Home/End jump to `min`/`max`; holding a button repeats.

```html
<div style="display:grid;gap:16px;max-width:280px">
  <kern-step-input label="Target temperature" value="21.5" min="5" max="30" step="0.5" unit="°C" locale="en"></kern-step-input>
  <kern-step-input label="Timeout" value="30" min="1" max="600" unit="s" size="sm" hint="1–600 seconds"></kern-step-input>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
const out = root.querySelector('output');
for (const el of root.querySelectorAll('kern-step-input')) {
  el.addEventListener('kernChange', (e) => (out.textContent = 'kernChange → ' + e.detail.value));
}
```
