# Aligned to the end

`align="end"` lines up the menu's right edge with the trigger, for triggers at the right of a row or toolbar. Without `label` the menu takes its name from the trigger's text; items without `value` pass their text.

```html
<div style="display:flex;justify-content:flex-end">
  <kern-menu align="end">
    <kern-button slot="trigger" size="sm">Export <kern-icon name="chevron-down"></kern-icon></kern-button>
    <kern-menu-item icon="download">CSV</kern-menu-item>
    <kern-menu-item icon="download">JSON</kern-menu-item>
    <kern-menu-item icon="copy">Copy IP list</kern-menu-item>
  </kern-menu>
</div>
```
