# Hint for an icon button

Wrap the trigger; the tooltip shows on hover after `delay` ms and immediately on keyboard focus, and Escape hides it. The trigger gets `aria-describedby` pointing to the text. Tooltips add hints only — touch devices never see them, so the button still needs its own `label`.

```html
<div style="display:flex;gap:12px;align-items:center;padding-top:32px">
  <kern-tooltip text="Restart device">
    <kern-button variant="ghost" icon-only label="Restart"><kern-icon name="power"></kern-icon></kern-button>
  </kern-tooltip>
  <kern-tooltip text="Query status now" placement="bottom" delay="0">
    <kern-button variant="ghost" icon-only label="Refresh"><kern-icon name="refresh"></kern-icon></kern-button>
  </kern-tooltip>
</div>
```
