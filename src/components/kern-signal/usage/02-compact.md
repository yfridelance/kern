# Bars only

`hide-value` drops the dBm number for narrow table columns; wrap it in `kern-tooltip` to keep the value reachable.

```html
<kern-tooltip text="−58 dBm · good">
  <kern-signal rssi="-58" hide-value tabindex="0"></kern-signal>
</kern-tooltip>
```
