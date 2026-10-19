# In headers and lists

Typical places are the topbar (server connection), page headers and list rows. Always keep the word: the dot alone is only for the `start` slot of a kern-list-item whose text already states the state.

```html
<kern-list label="Devices" style="max-width:420px">
  <kern-list-item heading="Bad Lüftung" description="Plus 1PM · 192.168.1.21">
    <kern-status slot="meta" tone="ok">Active</kern-status>
  </kern-list-item>
  <kern-list-item heading="Rollladen Süd" description="Pro 2PM · not reachable since yesterday">
    <kern-status slot="start" tone="warn"></kern-status>
  </kern-list-item>
</kern-list>
```
