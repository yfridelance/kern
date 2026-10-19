# kern-progress



<!-- Auto Generated Below -->


## Overview

Progress of a long operation. With `value` it shows the share of `max` (scan, template on N devices);
without `value` it runs as an indeterminate band (firmware update, reboot).

## Usage

### 01-basic

# Determinate and indeterminate

With `value` the bar shows the share of `max`; `label` sits on the left and `value-text` on the right above the bar. Without `value` it runs as an indeterminate band for operations of unknown length.

```html
<div style="display:grid;gap:16px;max-width:480px">
  <kern-progress label="Scan 192.168.1.0/24" value="148" max="254" value-text="148 / 254"></kern-progress>
  <kern-progress label="Template on 6 devices" value="50" value-text="3 of 6"></kern-progress>
  <kern-progress label="Installing firmware …"></kern-progress>
</div>
```


### 02-live

# Updating the value

Set `value` and `valueText` as the operation advances.

```html
<div style="display:grid;gap:12px;max-width:480px">
  <kern-progress label="Scan 192.168.1.0/24" value="0" max="254" value-text="0 / 254"></kern-progress>
  <kern-button class="start" size="sm" style="justify-self:start">Start scan</kern-button>
</div>
```

```js
const bar = root.querySelector('kern-progress');
root.querySelector('.start').addEventListener('click', () => {
  let n = 0;
  const id = setInterval(() => {
    n = Math.min(254, n + 17);
    bar.value = n;
    bar.valueText = `${n} / 254`;
    if (n === 254) clearInterval(id);
  }, 200);
});
```



## Properties

| Property    | Attribute    | Description                                        | Type                  | Default     |
| ----------- | ------------ | -------------------------------------------------- | --------------------- | ----------- |
| `label`     | `label`      | Text on the left above the bar.                    | `string \| undefined` | `undefined` |
| `max`       | `max`        |                                                    | `number`              | `100`       |
| `value`     | `value`      |                                                    | `number \| undefined` | `undefined` |
| `valueText` | `value-text` | Text on the right above the bar, e.g. "148 / 254". | `string \| undefined` | `undefined` |


## Shadow Parts

| Part    | Description     |
| ------- | --------------- |
| `"bar"` | The filled part |


----------------------------------------------


