# Basic field

A labelled text field with `hint`, `placeholder` and `required`. Use `mono` for IP addresses, MAC addresses and IDs, and `size="sm"` in toolbars and tables.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-input label="Device name" value="Kitchen Light" hint="Shown in the device list" required></kern-input>
  <kern-input label="MQTT server" value="192.168.1.5:1883" mono></kern-input>
  <kern-input size="sm" type="search" placeholder="Name, IP or MAC" aria-label-text="Search devices"></kern-input>
</div>
```
