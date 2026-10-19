# Custom brand and site switch

The `brand` slot replaces the default mark and app name. A small kern-select in the `end` slot switches between sites.

```html
<kern-topbar home-href="#">
  <a slot="brand" href="#" style="display:flex;align-items:center;gap:8px;color:inherit;text-decoration:none;font-weight:600">
    <kern-icon name="home"></kern-icon> Haus Seeblick
  </a>
  <a slot="nav" href="#" aria-current="page">Devices</a>
  <a slot="nav" href="#">Rooms</a>
  <kern-select slot="end" size="sm" aria-label-text="Choose site" style="width:180px">
    <option value="1">Haus Seeblick</option>
    <option value="2">Holiday flat</option>
    <option value="3">Office Bern</option>
  </kern-select>
  <kern-status slot="end" tone="warn">2 updates</kern-status>
</kern-topbar>
```
