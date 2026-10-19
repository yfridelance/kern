# kern-tooltip



<!-- Auto Generated Below -->


## Overview

Short hint for a control or an abbreviated value, shown on hover (after `delay`) and immediately on keyboard focus;
Escape hides it. Wrap the trigger (`<kern-tooltip text="Neustart"><kern-button …></kern-tooltip>`) or point at it
with `for="id"`. The trigger gets `aria-describedby` to a hidden copy of the text. Not for essential information:
touch devices never see it.

## Usage

### 01-basic

# Hint for an icon button

Wrap the trigger; the tooltip shows on hover after `delay` ms and immediately on keyboard focus, and Escape hides it. The trigger gets `aria-describedby` pointing to the text. Tooltips add hints only — touch devices never see them, so the button still needs its own `label`.

```html
<div style="display:flex;gap:12px;align-items:center;padding-top:32px">
  <kern-tooltip text="Restart device">
    <kern-button variant="ghost" icon-only label="Restart"><kern-icon name="power"></kern-icon></kern-button>
  </kern-tooltip>
  <kern-tooltip text="Query status now" placement="bottom" delay="0">
    <kern-button variant="ghost" icon-only label="Refresh"><kern-icon name="refresh"></kern-icon></kern-button>
  </kern-tooltip>
</div>
```


### 02-for-and-values

# Abbreviated values and `for`

A tooltip can explain a compact value such as signal bars; make a non-interactive trigger focusable with `tabindex="0"`. With `for` the tooltip points at a trigger elsewhere in the same document by its `id` instead of wrapping it; `disabled` turns it off.

```html
<div style="display:flex;gap:24px;align-items:center;padding-top:32px">
  <kern-tooltip text="−58 dBm · good"><kern-signal rssi="-58" hide-value tabindex="0"></kern-signal></kern-tooltip>
  <kern-button id="tooltip-firmware-trigger">Firmware 1.4.4</kern-button>
  <kern-tooltip for="tooltip-firmware-trigger" text="Released 2026-10-02 · Stable channel"></kern-tooltip>
</div>
```



## Properties

| Property    | Attribute   | Description                                                     | Type                  | Default     |
| ----------- | ----------- | --------------------------------------------------------------- | --------------------- | ----------- |
| `delay`     | `delay`     | Hover delay in milliseconds.                                    | `number`              | `400`       |
| `disabled`  | `disabled`  |                                                                 | `boolean`             | `false`     |
| `for`       | `for`       | Id of the trigger in the same document, instead of wrapping it. | `string \| undefined` | `undefined` |
| `placement` | `placement` | Preferred side; flips when there is no room.                    | `"bottom" \| "top"`   | `'top'`     |
| `text`      | `text`      |                                                                 | `string`              | `''`        |


## Slots

| Slot | Description                          |
| ---- | ------------------------------------ |
|      | The trigger (when `for` is not used) |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"tooltip"` | The bubble  |


----------------------------------------------


