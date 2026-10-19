# Horizontal, required and disabled

`orientation="horizontal"` lays short options out in a row. `required` with no value blocks form submission; `error` shows a message. `disabled` on the group disables all options.

```html
<div style="display:grid;gap:16px">
  <kern-radio-group label="Power-on state" orientation="horizontal" required error="Please choose a state">
    <kern-radio value="off" label="Off"></kern-radio>
    <kern-radio value="on" label="On"></kern-radio>
    <kern-radio value="restore" label="Restore last"></kern-radio>
  </kern-radio-group>
  <kern-radio-group label="Relay mode" orientation="horizontal" value="switch" disabled>
    <kern-radio value="switch" label="Switch"></kern-radio>
    <kern-radio value="detached" label="Detached"></kern-radio>
  </kern-radio-group>
</div>
```
