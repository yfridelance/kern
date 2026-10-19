# Required, read-only and small

`required` blocks an empty form submission; `readonly` and `disabled` work as on kern-input.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-mac-input label="New device" required></kern-mac-input>
  <kern-mac-input label="Bathroom Fan" value="C8:2B:96:1A:3F:00" readonly></kern-mac-input>
  <kern-mac-input aria-label-text="MAC filter" size="sm" format="plain" placeholder="C82B961A3F00" disabled></kern-mac-input>
</div>
```
