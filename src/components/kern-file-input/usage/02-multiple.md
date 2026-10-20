# Several files

With `multiple`, new files are added to the list instead of replacing it. Set `files = []` to clear the list from script.

```html
<div style="display:grid;gap:12px;max-width:420px">
  <kern-file-input label="Configuration backups" accept=".json" multiple max-size="500KB" label-drop="or drop them here"></kern-file-input>
  <kern-file-input label="Certificate" accept=".pem,.crt" disabled hint="Only with MQTT over TLS"></kern-file-input>
  <kern-button size="sm" variant="ghost" style="justify-self:start">Clear backups</kern-button>
</div>
```

```js
const input = root.querySelector('kern-file-input');
root.querySelector('kern-button').addEventListener('click', () => (input.files = []));
```
