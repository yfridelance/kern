# Basic select

Options come from child `<option>` elements (`disabled` and `selected` are read). Keyboard: Enter, Space or the arrow keys open the list; arrow keys, Home, End or typing a letter move; Enter or Space picks; Escape closes.

```html
<div style="display:grid;gap:16px;max-width:320px">
  <kern-select label="Site" value="home" hint="Where the device is installed">
    <option value="home">Lakeview House</option>
    <option value="flat">Holiday Flat</option>
    <option value="office">Office Bern</option>
  </kern-select>
  <kern-select label="Update channel" placeholder="Choose a channel" required error="Please choose a channel">
    <option value="stable">Stable</option>
    <option value="beta">Beta</option>
  </kern-select>
  <kern-select size="sm" aria-label-text="Site" value="home" disabled>
    <option value="home">Lakeview House</option>
  </kern-select>
</div>
```
