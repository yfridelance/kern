# Views of one device

Each kern-tab-panel becomes a tab: `label` is the tab text, `name` the value kern-tabs selects by, and `count` adds a number badge. `label` on kern-tabs names the tab list for screen readers.

```html
<kern-tabs label="Device data" style="max-width:520px">
  <kern-tab-panel name="config" label="Config">
    <kern-kv>
      <kern-kv-item label="Name">Bad Lüftung</kern-kv-item>
      <kern-kv-item label="IP" mono>192.168.1.21</kern-kv-item>
    </kern-kv>
  </kern-tab-panel>
  <kern-tab-panel name="status" label="Status">
    <kern-progress label="Installing firmware …"></kern-progress>
  </kern-tab-panel>
  <kern-tab-panel name="snapshots" label="Snapshots" count="12">
    <p style="margin:0;color:var(--text-muted)">12 snapshots, the latest from today 09:41.</p>
  </kern-tab-panel>
</kern-tabs>
```
