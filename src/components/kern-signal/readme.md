# kern-signal



<!-- Auto Generated Below -->


## Overview

WLAN signal strength: four bars plus dBm. ≥ −55: 4 · ≥ −67: 3 · ≥ −75: 2 · ≥ −85: 1 (warn) · below: 0 (danger).

## Properties

| Property    | Attribute    | Description                                            | Type                  | Default         |
| ----------- | ------------ | ------------------------------------------------------ | --------------------- | --------------- |
| `hideValue` | `hide-value` | Hide the dBm number (narrow table columns).            | `boolean`             | `false`         |
| `label`     | `label`      |                                                        | `string`              | `'WLAN-Signal'` |
| `rssi`      | `rssi`       | RSSI in dBm (Gen2+ `wifi.rssi`, Gen1 `wifi_sta.rssi`). | `number \| undefined` | `undefined`     |


----------------------------------------------


