# Read-only and required

`readonly` only shows the rating, e.g. in a card or table. `required` blocks submitting while the value is 0; `disabled` stops interaction.

```html
<div style="display:grid;gap:16px">
  <kern-rating value="5" readonly size="sm" aria-label-text="Rating"></kern-rating>
  <kern-rating label="Rate this update" required error="Please rate the update"></kern-rating>
  <kern-rating label="Rating" value="3" disabled></kern-rating>
</div>
```
