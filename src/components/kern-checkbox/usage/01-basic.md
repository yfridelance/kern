# Checkboxes and filters

Slotted text is the label; Space toggles. `disabled` boxes cannot be changed and are left out of the form.

```html
<div style="display:grid;gap:12px">
  <kern-checkbox checked>Only with firmware update</kern-checkbox>
  <kern-checkbox>Show offline devices</kern-checkbox>
  <kern-checkbox checked disabled>Include Gen 1 devices (not supported)</kern-checkbox>
</div>
```
