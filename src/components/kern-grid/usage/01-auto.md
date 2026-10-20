# Tiles

Without `columns` the grid fits as many columns of at least `min` as there is room for, without breakpoints. Here at least 180 px; resize the window to see it reflow.

```html
<kern-grid min="180px" gap="sm">
  <kern-stat label="Devices online" value="36" unit="/ 38" delta="2" trend="down" meta="missing"></kern-stat>
  <kern-stat label="Updates" value="3" meta="available · Stable"></kern-stat>
  <kern-stat label="Errors (24 h)" value="5" delta="+3" trend="up" invert></kern-stat>
  <kern-stat label="Power" value="1’284" unit="W"></kern-stat>
</kern-grid>
```
