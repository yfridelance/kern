# Glyphs

`name` picks one of Kern's glyphs (the full list is exported as `ICON_NAMES`). Icons are sized by `font-size` and coloured with `currentColor`, so they follow the surrounding text. Without `label` an icon is decorative and hidden from screen readers.

```html
<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;font-size:20px">
  <kern-icon name="wifi"></kern-icon>
  <kern-icon name="power"></kern-icon>
  <kern-icon name="refresh"></kern-icon>
  <kern-icon name="bulb" style="color:var(--warn)"></kern-icon>
  <kern-icon name="thermometer"></kern-icon>
  <kern-icon name="settings" style="font-size:28px"></kern-icon>
</div>
```
