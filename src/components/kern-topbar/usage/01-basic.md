# App header

Brand on the left, the main navigation in the `nav` slot and tools in the `end` slot. Mark the current link with `aria-current="page"`; keep the navigation to at most six links.

```html
<kern-topbar app-name="Shelly Manager" suite="Homelab">
  <a slot="nav" href="#">Scan</a>
  <a slot="nav" href="#" aria-current="page">Inventory</a>
  <a slot="nav" href="#">Templates</a>
  <a slot="nav" href="#">Log</a>
  <kern-status slot="end" tone="ok">Server connected</kern-status>
  <kern-theme-toggle slot="end" small label-light="Switch to light theme" label-dark="Switch to dark theme"></kern-theme-toggle>
</kern-topbar>
```
