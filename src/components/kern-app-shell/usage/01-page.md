# Page frame

Without a `sidebar` the shell is a plain page frame: the topbar stays at the top while scrolling, the content gets a maximum width (`width="normal"`, `wide` or `full`) and page padding that grows with the room. Tab once on the page to see the skip link. In an app the shell fills the window; the examples set a smaller `min-height`.

```html
<kern-app-shell style="min-height:360px">
  <kern-topbar slot="topbar" app-name="Netzwerk" suite="Homelab">
    <a slot="nav" href="#" aria-current="page">Devices</a>
    <a slot="nav" href="#">Leases</a>
    <kern-theme-toggle slot="end" small></kern-theme-toggle>
  </kern-topbar>
  <kern-page-header heading="Devices" description="38 devices in 4 networks"></kern-page-header>
  <kern-grid min="180px" gap="sm">
    <kern-stat label="Online" value="36" unit="/ 38"></kern-stat>
    <kern-stat label="Leases" value="112"></kern-stat>
    <kern-stat label="Blocked (24 h)" value="1’204"></kern-stat>
  </kern-grid>
  <span slot="footer">Netzwerk 2.3 · Homelab</span>
</kern-app-shell>
```
