# kern-signal



<!-- Auto Generated Below -->


## Overview

WLAN signal strength: four bars plus dBm. ≥ −55: 4 · ≥ −67: 3 · ≥ −75: 2 · ≥ −85: 1 (warn) · below: 0 (danger).

## Usage

### 01-rssi

# Wi-Fi signal

Four bars plus the RSSI in dBm: ≥ −55 gives 4 bars, ≥ −67 3, ≥ −75 2, ≥ −85 1 (warn), below that 0 (danger). Set `label` for the accessible name.

```html
<div style="display:flex;flex-wrap:wrap;gap:24px">
  <kern-signal rssi="-52"></kern-signal>
  <kern-signal rssi="-63"></kern-signal>
  <kern-signal rssi="-71"></kern-signal>
  <kern-signal rssi="-82"></kern-signal>
  <kern-signal rssi="-91"></kern-signal>
  <kern-signal></kern-signal>
</div>
```


### 02-compact

# Bars only

`hide-value` drops the dBm number for narrow table columns; wrap it in `kern-tooltip` to keep the value reachable.

```html
<kern-tooltip text="−58 dBm · good">
  <kern-signal rssi="-58" hide-value tabindex="0"></kern-signal>
</kern-tooltip>
```



## Properties

| Property    | Attribute    | Description                                            | Type                  | Default     |
| ----------- | ------------ | ------------------------------------------------------ | --------------------- | ----------- |
| `hideValue` | `hide-value` | Hide the dBm number (narrow table columns).            | `boolean`             | `false`     |
| `label`     | `label`      |                                                        | `string \| undefined` | `undefined` |
| `rssi`      | `rssi`       | RSSI in dBm (Gen2+ `wifi.rssi`, Gen1 `wifi_sta.rssi`). | `number \| undefined` | `undefined` |


----------------------------------------------


