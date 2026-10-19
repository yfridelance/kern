# Complete form

All Kern form fields are form-associated: they take part in a native `<form>`, in `FormData`, in validation and in reset. `kern-button type="submit"` and `type="reset"` work like native buttons. Leave a required field empty or enter a short password to see the validation; Reset restores the initial values.

```html
<form style="display:grid;gap:16px;max-width:400px">
  <kern-input name="name" label="Device name" value="Bathroom Fan" required></kern-input>
  <kern-ip-input name="ip" label="Static IP" allow="single" value="192.168.1.21" required></kern-ip-input>
  <kern-input name="password" label="Device password" type="password" hint="At least 8 characters"></kern-input>
  <kern-select name="room" label="Room" placeholder="Choose a room" required>
    <option value="bath">Bathroom</option>
    <option value="kitchen">Kitchen</option>
    <option value="garage">Garage</option>
  </kern-select>
  <kern-switch name="cloud" checked>Cloud</kern-switch>
  <div style="display:flex;gap:8px;justify-content:flex-end">
    <kern-button type="reset" variant="ghost">Reset</kern-button>
    <kern-button type="submit" variant="primary">Save</kern-button>
  </div>
  <output style="font:12px var(--font-mono);color:var(--text-muted);white-space:pre"></output>
</form>
```

```js
const form = root.querySelector('form');
const password = root.querySelector('[name="password"]');
const out = root.querySelector('output');
password.addEventListener('kernChange', (e) => {
  const v = e.detail.value;
  password.error = v && v.length < 8 ? 'Too short' : undefined;
});
form.addEventListener('submit', (e) => {
  e.preventDefault();
  out.textContent = [...new FormData(form)].map(([k, v]) => `${k} = ${v}`).join('\n');
});
form.addEventListener('reset', () => {
  password.error = undefined;
  out.textContent = '';
});
```
