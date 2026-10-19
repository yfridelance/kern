# Abbreviated values and `for`

A tooltip can explain a compact value such as signal bars; make a non-interactive trigger focusable with `tabindex="0"`. With `for` the tooltip points at a trigger elsewhere in the same document by its `id` instead of wrapping it; `disabled` turns it off.

```html
<div style="display:flex;gap:24px;align-items:center;padding-top:32px">
  <kern-tooltip text="−58 dBm · good"><kern-signal rssi="-58" hide-value tabindex="0"></kern-signal></kern-tooltip>
  <kern-button id="tooltip-firmware-trigger">Firmware 1.4.4</kern-button>
  <kern-tooltip for="tooltip-firmware-trigger" text="Released 2026-10-02 · Stable channel"></kern-tooltip>
</div>
```
