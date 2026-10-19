# Any notation in, one notation out

Accepts `C82B961A3F00`, `c8:2b:…`, `c8-2b-…` or `c82b.961a.3f00` and normalises on Enter or when leaving the field. `format` (`colon`, `dash`, `dot`, `plain`) and `letter-case` set the output.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-mac-input label="MAC address" value="c82b961a3f00" hint="Any notation, e.g. c82b.961a.3f00" label-invalid="Not a valid MAC address"></kern-mac-input>
  <kern-mac-input label="MAC (dash, lower case)" value="C8:2B:96:1A:3F:00" format="dash" letter-case="lower"></kern-mac-input>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
const out = root.querySelector('output');
for (const el of root.querySelectorAll('kern-mac-input')) {
  el.addEventListener('kernChange', (e) => (out.textContent = 'kernChange → ' + e.detail.value));
}
```
