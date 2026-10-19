# Meaningful icons

When an icon carries information on its own, give it a `label`; it is then announced as an image. In buttons the icon stays decorative and the button gets the name instead.

```html
<p style="margin:0;display:flex;gap:12px;align-items:center">
  Bad Lüftung <kern-icon name="lock" label="Password protected"></kern-icon>
  <kern-button size="sm" variant="ghost" icon-only label="Restart"><kern-icon name="power"></kern-icon></kern-button>
</p>
```
