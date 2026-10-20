# Firmware upload

A drop zone with a button. `accept` and `max-size` are checked; rejected files are named in the message and not added. A new file replaces the previous one; × removes it. The form receives the file under `name`.

```html
<div style="display:grid;gap:16px;max-width:420px">
  <kern-file-input name="firmware" label="Firmware file" accept=".zip,.bin" max-size="16MB" hint=".zip or .bin, max. 16 MB" required label-drop="or drop it here" locale="en"></kern-file-input>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-file-input').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + (e.detail.files.map((f) => `${f.name} (${f.size} B)`).join(', ') || 'none');
});
```
