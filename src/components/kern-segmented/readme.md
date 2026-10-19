# kern-segmented



<!-- Auto Generated Below -->


## Overview

Compact single choice for 2–5 short options (filters, Stable/Beta, DHCP/Statisch), form-associated.
Options from the `options` property or child `<option>` elements. Arrow keys move the selection.

## Usage

### 01-basic

# Segmented choice

For 2–5 short options such as filters or Stable/Beta. Options come from child `<option>` elements; arrow keys move the selection. `label` is the group's accessible name.

```html
<div style="display:grid;gap:16px;justify-items:start">
  <kern-segmented label="Status" value="all">
    <option value="all">All</option>
    <option value="active">Active</option>
    <option value="missing">Missing</option>
  </kern-segmented>
  <kern-segmented name="channel" label="Update channel" value="stable" disabled>
    <option value="stable">Stable</option>
    <option value="beta">Beta</option>
  </kern-segmented>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-segmented').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + e.detail.value;
});
```


### 02-options

# Options property

Set `options` (`{ value, label, disabled? }[]`) from script instead of child elements.

```html
<kern-segmented label="Chart period" value="24h"></kern-segmented>
```

```js
root.querySelector('kern-segmented').options = [
  { value: '1h', label: '1 h' },
  { value: '24h', label: '24 h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days', disabled: true },
];
```



## Properties

| Property   | Attribute  | Description                   | Type                        | Default     |
| ---------- | ---------- | ----------------------------- | --------------------------- | ----------- |
| `disabled` | `disabled` |                               | `boolean`                   | `false`     |
| `label`    | `label`    | Accessible name of the group. | `string \| undefined`       | `undefined` |
| `name`     | `name`     |                               | `string \| undefined`       | `undefined` |
| `options`  | --         |                               | `KernOption[] \| undefined` | `undefined` |
| `value`    | `value`    |                               | `string`                    | `''`        |


## Events

| Event        | Description | Type                              |
| ------------ | ----------- | --------------------------------- |
| `kernChange` |             | `CustomEvent<{ value: string; }>` |


## Slots

| Slot | Description                           |
| ---- | ------------------------------------- |
|      | `<option>` elements (read, not shown) |


## Shadow Parts

| Part        | Description        |
| ----------- | ------------------ |
| `"segment"` | Each option button |


----------------------------------------------


