# Placeholders while loading

`text` draws `lines` lines (the last one shorter), `block` a rectangle with `width` and `height`, `circle` a dot of `size`. Skeletons are hidden from assistive technology; mark the loading container with `aria-busy="true"` instead.

```html
<div aria-busy="true" style="display:grid;gap:16px;max-width:360px">
  <div style="display:flex;gap:12px;align-items:center">
    <kern-skeleton variant="circle" size="32px"></kern-skeleton>
    <kern-skeleton lines="2"></kern-skeleton>
  </div>
  <kern-skeleton lines="3" width="80%"></kern-skeleton>
  <kern-skeleton variant="block" height="80px"></kern-skeleton>
</div>
```
