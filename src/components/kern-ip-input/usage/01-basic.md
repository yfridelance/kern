# Address, range or CIDR

One field accepts a single address, a range (`192.168.1.10-50`) or a CIDR block. Typed text is applied and normalised on Enter or when leaving the field; ranges and blocks show their size. `max-addresses` limits the size, `locale` formats the count.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-ip-input label="Scan range" value="192.168.1.0/24" max-addresses="1024" hint="Address, range or CIDR, max. 1024 addresses" locale="en"></kern-ip-input>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-ip-input').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + JSON.stringify(e.detail);
});
```
