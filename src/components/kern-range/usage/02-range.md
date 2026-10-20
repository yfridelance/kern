# Two handles

With `range`, `value` is `"from/to"` and the handles cannot cross. `label-from` and `label-to` name the handles for screen readers.

```html
<div style="max-width:360px">
  <kern-range name="window" label="Active between" range value="8/18" min="0" max="24" unit="h" marks="0,6,12,18,24" hint="No notifications outside this window"></kern-range>
</div>
```
