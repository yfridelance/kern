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


### 03-expand-all

# Expand all / Collapse all

`expandAll()`, `collapseAll()` and `setOpenDepth(depth)` open or close every node to a depth, also nodes toggled by hand and also when the depth is already set. Setting `openDepth` resets hand toggles the same way when the value changes.

```html
<div style="display:flex;gap:8px;margin-bottom:8px">
  <kern-button size="sm" variant="ghost" class="expand">Expand all</kern-button>
  <kern-button size="sm" variant="ghost" class="collapse">Collapse all</kern-button>
  <kern-button size="sm" variant="ghost" class="reset">Depth 1</kern-button>
</div>
<kern-json open-depth="1"></kern-json>
```

```js
const json = root.querySelector('kern-json');
json.data = {
  sys: { device: { name: 'Boiler', mac: 'C82B961A3F00', fw_id: '20240819-074343/1.4.2' }, location: { tz: 'Europe/Zurich', lat: 47.37, lon: 8.54 } },
  wifi: { sta: { ssid: 'Home', ipv4mode: 'dhcp' }, ap: { enable: false } },
  switch: [{ id: 0, name: 'Heater', initial_state: 'off', power_limit: 2500 }],
};
root.querySelector('.expand').addEventListener('click', () => json.expandAll());
root.querySelector('.collapse').addEventListener('click', () => json.collapseAll());
root.querySelector('.reset').addEventListener('click', () => json.setOpenDepth(1));
```



## Properties

| Property    | Attribute    | Description                                                                                                               | Type      | Default     |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `data`      | --           | The value to show (object, array or primitive). A string is parsed as JSON when possible.                                 | `unknown` | `undefined` |
| `openDepth` | `open-depth` | Nodes up to this depth start open. Changing it opens or closes every node to that depth, including nodes toggled by hand. | `number`  | `1`         |


## Methods

### `collapseAll() => Promise<void>`

Closes every node.

#### Returns

Type: `Promise<void>`



### `expandAll() => Promise<void>`

Opens every node.

#### Returns

Type: `Promise<void>`



### `setOpenDepth(depth: number) => Promise<void>`

Opens nodes up to `depth` and closes all others; also resets nodes toggled by hand when `depth` is unchanged.

#### Parameters

| Name    | Type     | Description |
| ------- | -------- | ----------- |
| `depth` | `number` |             |

#### Returns

Type: `Promise<void>`




----------------------------------------------


