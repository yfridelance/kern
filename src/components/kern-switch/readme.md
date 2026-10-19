# kern-switch



<!-- Auto Generated Below -->


## Overview

On/off switch for settings (Cloud, Bluetooth, MQTT), form-associated.
The label names the thing ("Cloud"), not the action.

## Usage

### 01-basic

# Settings switches

The slotted text names the setting ("Cloud"), not the action. Space toggles; the form gets `value` (default `on`) under `name` only while checked.

```html
<div style="display:grid;gap:12px">
  <kern-switch name="cloud" checked>Cloud</kern-switch>
  <kern-switch name="ble">Bluetooth</kern-switch>
  <kern-switch name="mqtt" checked disabled>MQTT (managed by Home Assistant)</kern-switch>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
const out = root.querySelector('output');
for (const el of root.querySelectorAll('kern-switch')) {
  el.addEventListener('kernChange', (e) => (out.textContent = `kernChange → ${el.name}: ${e.detail.checked}`));
}
```


### 02-no-label

# Without visible text

In tables, give the switch an accessible name with `label` instead of slotted text.

```html
<div style="display:flex;gap:12px;align-items:center">
  <span>Kitchen Light</span>
  <kern-switch label="Kitchen Light on" checked></kern-switch>
</div>
```



## Properties

| Property   | Attribute  | Description                                    | Type                  | Default     |
| ---------- | ---------- | ---------------------------------------------- | --------------------- | ----------- |
| `checked`  | `checked`  |                                                | `boolean`             | `false`     |
| `disabled` | `disabled` |                                                | `boolean`             | `false`     |
| `label`    | `label`    | Accessible name when there is no visible text. | `string \| undefined` | `undefined` |
| `name`     | `name`     |                                                | `string \| undefined` | `undefined` |
| `value`    | `value`    | Form value when checked.                       | `string`              | `'on'`      |


## Events

| Event        | Description | Type                                 |
| ------------ | ----------- | ------------------------------------ |
| `kernChange` |             | `CustomEvent<{ checked: boolean; }>` |


## Slots

| Slot | Description |
| ---- | ----------- |
|      | Label text  |


## Shadow Parts

| Part      | Description      |
| --------- | ---------------- |
| `"track"` | The switch track |


----------------------------------------------


