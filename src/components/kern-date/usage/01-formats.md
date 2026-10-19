# Formats

`value` takes an ISO date, an ISO 8601 point in time or epoch milliseconds. `format` (`short`, `medium`, `long`, `full`) sets the length, `time` adds the time of day.

```html
<kern-kv>
  <kern-kv-item label="short"><kern-date value="2026-10-19" format="short"></kern-date></kern-kv-item>
  <kern-kv-item label="medium"><kern-date value="2026-10-19"></kern-date></kern-kv-item>
  <kern-kv-item label="long"><kern-date value="2026-10-19" format="long"></kern-date></kern-kv-item>
  <kern-kv-item label="full"><kern-date value="2026-10-19" format="full"></kern-date></kern-kv-item>
  <kern-kv-item label="time"><kern-date value="2026-10-19T09:41:00Z" time></kern-date></kern-kv-item>
</kern-kv>
```
