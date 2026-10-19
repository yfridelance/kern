# Single address only

`allow="single"` accepts only one address (also `range`, `cidr` or a space-separated combination); other forms show `label-not-allowed`. Also shown: `required`, `readonly`, `disabled` and `size="sm"`.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-ip-input label="Gateway" allow="single" value="192.168.1.1" required label-not-allowed="Only a single address is allowed here"></kern-ip-input>
  <kern-ip-input label="Device IP" allow="single" value="192.168.1.21" readonly></kern-ip-input>
  <kern-ip-input label="DNS" allow="single" value="192.168.1.2" disabled size="sm"></kern-ip-input>
</div>
```
