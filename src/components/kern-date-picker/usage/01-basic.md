# Date field

The value is an ISO date (`2026-10-19`); the field shows and accepts the locale's format. Typed text is applied on Enter or when leaving the field. Arrow Down or Alt+Arrow Down opens the calendar, Enter or Space picks, Escape closes.

```html
<div style="display:grid;gap:16px;max-width:280px">
  <kern-date-picker name="installed" label="Installed on" value="2026-03-14" locale="en-GB" clearable></kern-date-picker>
  <kern-date-picker label="Warranty until" value="2028-03-14" locale="de-CH" readonly></kern-date-picker>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-date-picker').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + e.detail.value;
});
```
