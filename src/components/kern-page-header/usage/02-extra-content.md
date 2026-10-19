# Status next to the heading

The default slot adds content after the heading, such as a badge or the device state.

```html
<kern-page-header heading="Bad Lüftung" description="Shelly Plus 1PM · 192.168.1.21">
  <kern-status tone="ok">Active</kern-status>
  <kern-badge mono>1.4.4</kern-badge>
  <kern-button slot="actions" variant="ghost">Snapshot</kern-button>
  <kern-button slot="actions" variant="primary">Update firmware</kern-button>
</kern-page-header>
```
