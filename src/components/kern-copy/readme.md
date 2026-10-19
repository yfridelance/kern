# kern-copy



<!-- Auto Generated Below -->


## Overview

Technical value in monospace with a copy button (MAC, IP, device ID, commands).
The button stops click propagation so a clickable table row does not open.

## Usage

### 01-values

# Copyable values

Shows a technical value in monospace with a copy button. The text content is copied unless `value` is set, e.g. to copy a MAC without separators. The button stops click propagation, so it is safe inside a clickable table row.

```html
<div style="display:grid;gap:8px;justify-items:start">
  <kern-copy>192.168.1.21</kern-copy>
  <kern-copy value="C82B961A3F00" label="Copy MAC">C8:2B:96:1A:3F:00</kern-copy>
  <kern-copy value="shellyplus1pm-c82b961a3f00"></kern-copy>
</div>
<p class="out" style="color:var(--text-muted);font-size:13px"></p>
```

```js
const out = root.querySelector('.out');
root.addEventListener('kernCopy', (e) => (out.textContent = 'kernCopy → ' + e.detail.value));
```



## Properties

| Property | Attribute | Description                                 | Type                  | Default      |
| -------- | --------- | ------------------------------------------- | --------------------- | ------------ |
| `label`  | `label`   | Tooltip and accessible label of the button. | `string`              | `'Kopieren'` |
| `value`  | `value`   | Copied text; defaults to the text content.  | `string \| undefined` | `undefined`  |


## Events

| Event      | Description              | Type                              |
| ---------- | ------------------------ | --------------------------------- |
| `kernCopy` | After a successful copy. | `CustomEvent<{ value: string; }>` |


## Slots

| Slot | Description                          |
| ---- | ------------------------------------ |
|      | Displayed text (defaults to `value`) |


## Shadow Parts

| Part       | Description     |
| ---------- | --------------- |
| `"button"` | The copy button |


----------------------------------------------


