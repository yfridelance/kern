# In forms and as a link

`type="submit"` and `type="reset"` work inside a `<form>` like native buttons. With `href` the button renders a link, e.g. to download a backup; use it when an action navigates.

```html
<form style="display:grid;gap:12px;max-width:320px">
  <kern-input name="name" label="Name" value="Bad Lüftung"></kern-input>
  <div style="display:flex;gap:8px;justify-content:flex-end">
    <kern-button href="data:application/json,%7B%7D" download="bad-lueftung.json" variant="ghost">
      <kern-icon slot="start" name="download"></kern-icon>Backup
    </kern-button>
    <kern-button type="reset" variant="ghost">Reset</kern-button>
    <kern-button type="submit" variant="primary">Save</kern-button>
  </div>
  <p class="out" style="margin:0;font-size:13px;color:var(--text-muted)"></p>
</form>
```

```js
root.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  root.querySelector('.out').textContent = 'submit → ' + JSON.stringify(Object.fromEntries(new FormData(e.target)));
});
```
