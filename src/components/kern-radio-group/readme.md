# kern-radio-group



<!-- Auto Generated Below -->


## Overview

Single choice from kern-radio children, form-associated. For longer or described options; for 2–5 short ones use
kern-segmented. One tab stop: arrow keys move and select (wrapping), Space/Enter selects the focused option.

## Usage

### 01-basic

# Radio group with descriptions

`kern-radio` children with `label` and `description`; a single option can be `disabled`. The group is one tab stop: arrow keys move and select (wrapping), Space or Enter selects the focused option.

```html
<div style="max-width:360px">
  <kern-radio-group name="ipmode" label="IP address" value="dhcp" hint="Takes effect after a restart">
    <kern-radio value="dhcp" label="DHCP" description="Address from the router"></kern-radio>
    <kern-radio value="static" label="Static" description="Fixed address and gateway"></kern-radio>
    <kern-radio value="ap" label="Access point" description="Only after a factory reset" disabled></kern-radio>
  </kern-radio-group>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-radio-group').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + e.detail.value;
});
```


### 02-horizontal

# Horizontal, required and disabled

`orientation="horizontal"` lays short options out in a row. `required` with no value blocks form submission; `error` shows a message. `disabled` on the group disables all options.

```html
<div style="display:grid;gap:16px">
  <kern-radio-group label="Power-on state" orientation="horizontal" required error="Please choose a state">
    <kern-radio value="off" label="Off"></kern-radio>
    <kern-radio value="on" label="On"></kern-radio>
    <kern-radio value="restore" label="Restore last"></kern-radio>
  </kern-radio-group>
  <kern-radio-group label="Relay mode" orientation="horizontal" value="switch" disabled>
    <kern-radio value="switch" label="Switch"></kern-radio>
    <kern-radio value="detached" label="Detached"></kern-radio>
  </kern-radio-group>
</div>
```



## Properties

| Property        | Attribute         | Description                                       | Type                         | Default      |
| --------------- | ----------------- | ------------------------------------------------- | ---------------------------- | ------------ |
| `ariaLabelText` | `aria-label-text` | Accessible name when there is no visible label.   | `string \| undefined`        | `undefined`  |
| `disabled`      | `disabled`        |                                                   | `boolean`                    | `false`      |
| `error`         | `error`           |                                                   | `string \| undefined`        | `undefined`  |
| `hint`          | `hint`            |                                                   | `string \| undefined`        | `undefined`  |
| `label`         | `label`           |                                                   | `string \| undefined`        | `undefined`  |
| `name`          | `name`            |                                                   | `string \| undefined`        | `undefined`  |
| `orientation`   | `orientation`     | Layout of the options.                            | `"horizontal" \| "vertical"` | `'vertical'` |
| `required`      | `required`        |                                                   | `boolean`                    | `false`      |
| `value`         | `value`           | Value of the checked kern-radio, empty when none. | `string`                     | `''`         |


## Events

| Event        | Description                    | Type                              |
| ------------ | ------------------------------ | --------------------------------- |
| `kernChange` | When the user picks an option. | `CustomEvent<{ value: string; }>` |


## Methods

### `setFocus() => Promise<void>`

Focuses the checked option (or the first).

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description         |
| ---- | ------------------- |
|      | kern-radio elements |


----------------------------------------------


