# Ignore volatile paths

`ignore` lists paths that do not count, as an array or comma-separated. A path also ignores everything below it, so `sys.updates` hides the whole update object. Without it, the device clock and uptime would show up in every comparison.

```html
<kern-json-diff ignore="time,unixtime,sys.uptime,sys.updates"></kern-json-diff>
```

```js
const diff = root.querySelector('kern-json-diff');
diff.from = { time: '08:00', unixtime: 1760421600, sys: { uptime: 356420, fw: '1.4.4', updates: { stable: '1.4.4' } }, relays: [{ ison: false }] };
diff.to = { time: '08:00', unixtime: 1760508000, sys: { uptime: 442820, fw: '1.4.4', updates: { stable: '1.5.0', beta: '1.6.0-beta1' } }, relays: [{ ison: true }] };
```
