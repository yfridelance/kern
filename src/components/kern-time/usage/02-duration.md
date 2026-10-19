# Durations

`duration` takes an ISO 8601 duration (`PT1H23M`) or a number of seconds, e.g. a device's `sys.uptime`. It takes precedence over `value`.

```html
<kern-kv>
  <kern-kv-item label="Uptime"><kern-time duration="356420"></kern-time></kern-kv-item>
  <kern-kv-item label="Auto-off"><kern-time duration="PT15M"></kern-time></kern-kv-item>
  <kern-kv-item label="Firmware update"><kern-time duration="PT1M30S"></kern-time></kern-kv-item>
  <kern-kv-item label="Maintenance window"><kern-time duration="PT2H"></kern-time></kern-kv-item>
</kern-kv>
```
