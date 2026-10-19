# Card with header and footer

`heading` titles the card; `meta` sits next to the heading and `actions` holds small buttons on the right. Form buttons go into the `footer` slot.

```html
<kern-card heading="Device" style="max-width:420px">
  <kern-badge slot="meta">Gen2</kern-badge>
  <kern-button slot="actions" size="sm" variant="ghost">Snapshot</kern-button>
  <kern-kv>
    <kern-kv-item label="Model">Shelly Plus 1PM</kern-kv-item>
    <kern-kv-item label="IP"><kern-copy>192.168.1.21</kern-copy></kern-kv-item>
    <kern-kv-item label="Firmware" mono>1.4.4</kern-kv-item>
  </kern-kv>
  <kern-button slot="footer" variant="ghost">Cancel</kern-button>
  <kern-button slot="footer" variant="primary">Save</kern-button>
</kern-card>
```
