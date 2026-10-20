# Subnet mask

`allow="mask"` accepts only contiguous subnet masks; `255.0.255.0` or an address like `192.168.1.1` shows `label-invalid-mask`. A prefix (`/22` or `22`) is normalised to the dotted mask, or the other way round with `mask-format="prefix"`. The field shows the prefix and the number of usable hosts (`label-mask-count`); `kernChange` reports `kind: 'mask'`, `mask`, `prefix` and `hosts`. With `allow="single mask"`, a valid mask counts as mask and anything else as address.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-ip-input label="Netmask" allow="mask" value="255.255.255.0" required hint="Dotted mask or prefix, e.g. /22" label-invalid-mask="Not a valid subnet mask" label-mask-count="/{prefix} · {n} hosts" locale="en"></kern-ip-input>
  <kern-ip-input label="Prefix" allow="mask" mask-format="prefix" value="/16" label-invalid-mask="Not a valid subnet mask" label-mask-count="/{prefix} · {n} hosts" locale="en"></kern-ip-input>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelectorAll('kern-ip-input').forEach((el) =>
  el.addEventListener('kernChange', (e) => {
    root.querySelector('output').textContent = 'kernChange → ' + JSON.stringify(e.detail);
  }),
);
```
