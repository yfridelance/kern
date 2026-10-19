# Options property and footer

The `options` property (`{ value, label, disabled? }[]`) takes precedence over child elements and suits data from an API. Buttons in the `footer` slot appear below the list; clicking one closes it.

```html
<div style="max-width:320px">
  <kern-select label="Gateway" placeholder="Choose a gateway">
    <kern-button slot="footer" size="sm" variant="ghost">Manage gateways …</kern-button>
  </kern-select>
</div>
```

```js
const select = root.querySelector('kern-select');
select.options = [
  { value: '192.168.1.1', label: 'Router (192.168.1.1)' },
  { value: '192.168.1.2', label: 'Pi-hole (192.168.1.2)' },
  { value: '192.168.1.3', label: 'Old router (offline)', disabled: true },
];
select.value = '192.168.1.1';
```
