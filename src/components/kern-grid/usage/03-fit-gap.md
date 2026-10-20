# Columns per width, fit and gap

`columns-sm`, `columns-md` and `columns-lg` change the column count with the grid width; children without `kern-grid-item` take one column each. In auto mode `fit` stretches few items over the whole width instead of leaving empty columns. `gap` is `sm` (12 px), `md` (16 px) or `lg` (24 px); `align="start"` keeps items at their own height.

```html
<kern-grid columns="1" columns-sm="2" columns-lg="4" gap="lg" align="start">
  <kern-card heading="Network">DHCP, 192.168.1.0/24</kern-card>
  <kern-card heading="Cloud">Off</kern-card>
  <kern-card heading="Updates">Stable, automatic at night</kern-card>
  <kern-card heading="Backup">Daily, 14 kept</kern-card>
</kern-grid>
<kern-grid min="200px" fit style="margin-top:16px">
  <kern-card heading="Fit">Two items fill the width.</kern-card>
  <kern-card heading="Fit">With auto-fill they would keep empty columns.</kern-card>
</kern-grid>
```
