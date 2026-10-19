# Radio group with descriptions

`kern-radio` children with `label` and `description`; a single option can be `disabled`. The group is one tab stop: arrow keys move and select (wrapping), Space or Enter selects the focused option.

```html
<div style="max-width:360px">
  <kern-radio-group name="ipmode" label="IP address" value="dhcp" hint="Takes effect after a restart">
    <kern-radio value="dhcp" label="DHCP" description="Address from the router"></kern-radio>
    <kern-radio value="static" label="Static" description="Fixed address and gateway"></kern-radio>
    <kern-radio value="ap" label="Access point" description="Only after a factory reset" disabled></kern-radio>
  </kern-radio-group>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-radio-group').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + e.detail.value;
});
```
