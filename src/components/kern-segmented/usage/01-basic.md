# Segmented choice

For 2–5 short options such as filters or Stable/Beta. Options come from child `<option>` elements; arrow keys move the selection. `label` is the group's accessible name.

```html
<div style="display:grid;gap:16px;justify-items:start">
  <kern-segmented label="Status" value="all">
    <option value="all">All</option>
    <option value="active">Active</option>
    <option value="missing">Missing</option>
  </kern-segmented>
  <kern-segmented name="channel" label="Update channel" value="stable" disabled>
    <option value="stable">Stable</option>
    <option value="beta">Beta</option>
  </kern-segmented>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-segmented').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + e.detail.value;
});
```
