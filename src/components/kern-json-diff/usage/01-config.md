# Config snapshots

Compare two snapshots of a device config. Set `from` and `to` as properties (or JSON strings); each changed, added or removed path gets a row, with a summary above. `label-before` and `label-after` name the two states, e.g. by the time of the snapshot.

```html
<kern-json-diff label-before="14.10. 08:00" label-after="15.10. 08:00"></kern-json-diff>
```

```js
const diff = root.querySelector('kern-json-diff');
diff.from = {
  sys: { device: { name: 'Bad Lüftung', eco_mode: false }, sntp: { server: 'time.google.com' } },
  wifi: { sta: { ssid: 'Home', ipv4mode: 'dhcp' } },
  mqtt: { enable: false, server: null },
  switch: [{ id: 0, name: 'Fan', auto_off: false }],
  cloud: { enable: true },
};
diff.to = {
  sys: { device: { name: 'Bad Lüftung', eco_mode: true }, sntp: { server: 'ch.pool.ntp.org' } },
  wifi: { sta: { ssid: 'Home', ipv4mode: 'static', ip: '192.168.1.21' } },
  mqtt: { enable: true, server: '192.168.1.5:1883' },
  switch: [{ id: 0, name: 'Fan', auto_off: true, auto_off_delay: 900 }],
};
```
