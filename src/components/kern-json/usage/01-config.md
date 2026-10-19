# Device config

A collapsible JSON tree. Set `data` as a property (object, array or primitive); closed nodes show their size. `open-depth` sets how many levels start open.

```html
<kern-json open-depth="1"></kern-json>
```

```js
root.querySelector('kern-json').data = {
  sys: { device: { name: 'Bathroom fan', mac: 'C82B961A3F00', eco_mode: false }, sntp: { server: 'time.google.com' } },
  wifi: { sta: { ssid: 'Home', ipv4mode: 'static', ip: '192.168.1.21' }, roam: { rssi_thr: -80, interval: 60 } },
  mqtt: { enable: true, server: '192.168.1.5:1883', user: null },
  switch: [{ id: 0, name: 'Fan', auto_off: true, auto_off_delay: 900 }],
};
```
