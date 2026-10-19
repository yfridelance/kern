# kern-input



<!-- Auto Generated Below -->


## Overview

Labelled text field (text, password, search, number …), form-associated.
Use `mono` for IP, MAC, CIDR and IDs.

## Usage

### 01-basic

# Basic field

A labelled text field with `hint`, `placeholder` and `required`. Use `mono` for IP addresses, MAC addresses and IDs, and `size="sm"` in toolbars and tables.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-input label="Device name" value="Kitchen Light" hint="Shown in the device list" required></kern-input>
  <kern-input label="MQTT server" value="192.168.1.5:1883" mono></kern-input>
  <kern-input size="sm" type="search" placeholder="Name, IP or MAC" aria-label-text="Search devices"></kern-input>
</div>
```


### 02-states

# Error, disabled and read-only

`error` shows a message and marks the field invalid, so it also blocks form submission. `disabled` fields are skipped by the form; `readonly` fields are submitted but cannot be edited.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-input label="Device password" type="password" value="secret" error="Wrong credentials"></kern-input>
  <kern-input label="Firmware" value="1.4.2-gf2c8e7a" mono readonly></kern-input>
  <kern-input label="Cloud token" value="Managed by the cloud" disabled></kern-input>
  <kern-input label="Auto-off" type="number" value="15" min="0" max="120" step="5" hint="Minutes, 0–120"></kern-input>
</div>
```


### 03-form

# Complete form

All Kern form fields are form-associated: they take part in a native `<form>`, in `FormData`, in validation and in reset. `kern-button type="submit"` and `type="reset"` work like native buttons. Leave a required field empty or enter a short password to see the validation; Reset restores the initial values.

```html
<form style="display:grid;gap:16px;max-width:400px">
  <kern-input name="name" label="Device name" value="Bathroom Fan" required></kern-input>
  <kern-ip-input name="ip" label="Static IP" allow="single" value="192.168.1.21" required></kern-ip-input>
  <kern-input name="password" label="Device password" type="password" hint="At least 8 characters"></kern-input>
  <kern-select name="room" label="Room" placeholder="Choose a room" required>
    <option value="bath">Bathroom</option>
    <option value="kitchen">Kitchen</option>
    <option value="garage">Garage</option>
  </kern-select>
  <kern-switch name="cloud" checked>Cloud</kern-switch>
  <div style="display:flex;gap:8px;justify-content:flex-end">
    <kern-button type="reset" variant="ghost">Reset</kern-button>
    <kern-button type="submit" variant="primary">Save</kern-button>
  </div>
  <output style="font:12px var(--font-mono);color:var(--text-muted);white-space:pre"></output>
</form>
```

```js
const form = root.querySelector('form');
const password = root.querySelector('[name="password"]');
const out = root.querySelector('output');
password.addEventListener('kernChange', (e) => {
  const v = e.detail.value;
  password.error = v && v.length < 8 ? 'Too short' : undefined;
});
form.addEventListener('submit', (e) => {
  e.preventDefault();
  out.textContent = [...new FormData(form)].map(([k, v]) => `${k} = ${v}`).join('\n');
});
form.addEventListener('reset', () => {
  password.error = undefined;
  out.textContent = '';
});
```



## Properties

| Property        | Attribute         | Description                                     | Type                                                                        | Default     |
| --------------- | ----------------- | ----------------------------------------------- | --------------------------------------------------------------------------- | ----------- |
| `ariaLabelText` | `aria-label-text` | Accessible name when there is no visible label. | `string \| undefined`                                                       | `undefined` |
| `autocomplete`  | `autocomplete`    |                                                 | `string \| undefined`                                                       | `undefined` |
| `disabled`      | `disabled`        |                                                 | `boolean`                                                                   | `false`     |
| `error`         | `error`           | Error text; also marks the field invalid.       | `string \| undefined`                                                       | `undefined` |
| `hint`          | `hint`            |                                                 | `string \| undefined`                                                       | `undefined` |
| `label`         | `label`           |                                                 | `string \| undefined`                                                       | `undefined` |
| `max`           | `max`             |                                                 | `number \| string \| undefined`                                             | `undefined` |
| `maxlength`     | `maxlength`       |                                                 | `number \| undefined`                                                       | `undefined` |
| `min`           | `min`             | For `type="number"`.                            | `number \| string \| undefined`                                             | `undefined` |
| `mono`          | `mono`            |                                                 | `boolean`                                                                   | `false`     |
| `name`          | `name`            |                                                 | `string \| undefined`                                                       | `undefined` |
| `pattern`       | `pattern`         |                                                 | `string \| undefined`                                                       | `undefined` |
| `placeholder`   | `placeholder`     |                                                 | `string \| undefined`                                                       | `undefined` |
| `readonly`      | `readonly`        |                                                 | `boolean`                                                                   | `false`     |
| `required`      | `required`        |                                                 | `boolean`                                                                   | `false`     |
| `size`          | `size`            |                                                 | `"md" \| "sm"`                                                              | `'md'`      |
| `step`          | `step`            |                                                 | `number \| string \| undefined`                                             | `undefined` |
| `type`          | `type`            |                                                 | `"email" \| "number" \| "password" \| "search" \| "tel" \| "text" \| "url"` | `'text'`    |
| `value`         | `value`           |                                                 | `string`                                                                    | `''`        |


## Events

| Event        | Description                                                   | Type                              |
| ------------ | ------------------------------------------------------------- | --------------------------------- |
| `kernChange` | On every keystroke (also used by the Angular value accessor). | `CustomEvent<{ value: string; }>` |
| `kernInput`  | On every keystroke.                                           | `CustomEvent<{ value: string; }>` |


## Methods

### `select() => Promise<void>`

Selects the text.

#### Returns

Type: `Promise<void>`



### `setFocus() => Promise<void>`

Focuses the native input.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part        | Description      |
| ----------- | ---------------- |
| `"control"` | The native input |


----------------------------------------------


