# Table toolbar

Search and filters go into the default slot on the left; the result count and actions into the `end` slot on the right.

```html
<kern-toolbar>
  <kern-input size="sm" type="search" placeholder="Name, IP or MAC" aria-label-text="Search" style="width:240px"></kern-input>
  <kern-segmented label="Status" value="all">
    <option value="all">All</option>
    <option value="active">Active</option>
    <option value="missing">Missing</option>
  </kern-segmented>
  <kern-checkbox>Firmware update only</kern-checkbox>
  <span slot="end" style="font-size:13px;color:var(--text-muted)">4 of 38</span>
  <kern-button slot="end" size="sm">Export</kern-button>
</kern-toolbar>
```
