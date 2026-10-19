# Searchable and multiple

`searchable` adds a search field that filters by label. With `multiple`, `value` is a `string[]` shown as chips (× or Backspace removes one), the list stays open while you toggle options, and the form receives one entry per value.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-select label="Model" placeholder="Choose a model" searchable>
    <option value="1pm">Plus 1PM</option>
    <option value="2pm">Plus 2PM</option>
    <option value="i4">Plus i4</option>
    <option value="uni">Plus Uni</option>
    <option value="ht" disabled>H&amp;T (not supported)</option>
    <option value="dimmer">Dimmer 2</option>
    <option value="em">Pro 3EM</option>
    <option value="mini">Mini 1PM Gen3</option>
  </kern-select>
  <kern-select label="Rooms" placeholder="Choose rooms" multiple searchable>
    <option value="bath" selected>Bathroom</option>
    <option value="kitchen" selected>Kitchen</option>
    <option value="living">Living room</option>
    <option value="bedroom">Bedroom</option>
    <option value="garage">Garage</option>
    <option value="garden">Garden</option>
  </kern-select>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
const out = root.querySelector('output');
for (const el of root.querySelectorAll('kern-select')) {
  el.addEventListener('kernChange', (e) => (out.textContent = 'kernChange → ' + JSON.stringify(e.detail)));
}
```
