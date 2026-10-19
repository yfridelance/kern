# Time field

Segments for hours and minutes; the value is `HH:mm`. Per segment: Arrow Up/Down change it (minutes in `step` seconds), digits type it and move on, Arrow Left/Right switch segments, Backspace clears. `locale` decides 12- or 24-hour display unless `hour12` is set.

```html
<div style="display:grid;gap:16px;max-width:240px">
  <kern-time-picker name="on" label="Switch on at" value="06:30" locale="de-CH"></kern-time-picker>
  <kern-time-picker label="Switch off at" value="22:15" locale="en-US" hint="12-hour clock: A/P set AM/PM"></kern-time-picker>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
const out = root.querySelector('output');
for (const el of root.querySelectorAll('kern-time-picker')) {
  el.addEventListener('kernChange', (e) => (out.textContent = 'kernChange → ' + e.detail.value));
}
```
