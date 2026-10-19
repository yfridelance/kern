# kern-json



<!-- Auto Generated Below -->


## Overview

Collapsible JSON tree for configs, status and device info (native `<details>`, keyboard accessible).
Closed nodes show their size ({4}, [2]).

## Usage

### 01-config

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


### 02-string

# From a JSON string

A string in the `data` attribute is parsed as JSON when possible, so short values can be written directly in HTML. `open-depth="2"` opens nested objects too.

```html
<kern-json open-depth="2" data='{"wifi":{"rssi":-63,"ssid":"Home","sta_ip":"192.168.1.21"},"uptime":356420,"ram_free":98764,"cloud":{"connected":false}}'></kern-json>
```



## Properties

| Property    | Attribute    | Description                                                                               | Type      | Default     |
| ----------- | ------------ | ----------------------------------------------------------------------------------------- | --------- | ----------- |
| `data`      | --           | The value to show (object, array or primitive). A string is parsed as JSON when possible. | `unknown` | `undefined` |
| `openDepth` | `open-depth` | Nodes up to this depth start open.                                                        | `number`  | `1`         |


----------------------------------------------


