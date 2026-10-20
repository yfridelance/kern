# Date range

Two dates with a calendar popover. `start` and `end` are ISO dates; `value` and the form value are the interval `start/end`. An end before the start is swapped.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-date-range-picker name="period" label="Report period" start="2026-10-01" end="2026-10-14" locale="en-GB" clearable></kern-date-range-picker>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-date-range-picker').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + JSON.stringify(e.detail);
});
```
