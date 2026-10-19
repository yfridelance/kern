# Time of day

`value` takes `HH:mm[:ss]`, or a point in time whose time is shown. `seconds` adds seconds, `hour12` forces the 12-hour clock, and `mono` uses monospace digits.

```html
<kern-kv>
  <kern-kv-item label="Schedule">daily at <kern-time value="06:30"></kern-time></kern-kv-item>
  <kern-kv-item label="12-hour"><kern-time value="18:45" hour12></kern-time></kern-kv-item>
  <kern-kv-item label="Last ping"><kern-time value="2026-10-19T09:41:27Z" seconds mono time-zone="Europe/Zurich"></kern-time></kern-kv-item>
</kern-kv>
```
