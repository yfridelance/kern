# Empty state

When a filter matches nothing, render a single cell spanning all columns with `class="empty"`.

```html
<kern-table>
  <table>
    <thead>
      <tr><th>Name</th><th>IP</th><th>Status</th></tr>
    </thead>
    <tbody>
      <tr><td colspan="3" class="empty">No devices match “garage”.</td></tr>
    </tbody>
  </table>
</kern-table>
```
