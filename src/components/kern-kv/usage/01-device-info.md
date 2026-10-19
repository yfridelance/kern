# Device information

`kern-kv` lists `kern-kv-item` rows with the label in a narrow left column. Set `mono` on technical values, use `kern-copy` for copyable ones, and show unknown values as “–”, never empty.

```html
<kern-kv>
  <kern-kv-item label="Model">Shelly Plus 1PM</kern-kv-item>
  <kern-kv-item label="Device ID" mono>shellyplus1pm-c82b961a3f00</kern-kv-item>
  <kern-kv-item label="MAC"><kern-copy>C8:2B:96:1A:3F:00</kern-copy></kern-kv-item>
  <kern-kv-item label="IP"><kern-copy>192.168.1.21</kern-copy></kern-kv-item>
  <kern-kv-item label="Signal"><kern-signal rssi="-63" label="Wi-Fi signal"></kern-signal></kern-kv-item>
  <kern-kv-item label="Firmware" mono>1.4.4</kern-kv-item>
  <kern-kv-item label="Uptime"><kern-time duration="356420"></kern-time></kern-kv-item>
  <kern-kv-item label="Cloud">–</kern-kv-item>
</kern-kv>
```
