# Loading state

While data loads, fill the card with kern-skeleton placeholders and mark it with `aria-busy="true"`.

```html
<kern-card heading="Loading …" aria-busy="true" style="max-width:320px">
  <div style="display:flex;gap:12px;align-items:center">
    <kern-skeleton variant="circle" size="28px"></kern-skeleton>
    <kern-skeleton lines="2"></kern-skeleton>
  </div>
  <kern-skeleton variant="block" height="40px" style="margin-top:12px"></kern-skeleton>
</kern-card>
```
