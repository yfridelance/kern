# Settings sections

Each kern-accordion-item is a collapsible section; `open` expands it initially. Opening one closes the others. Use the `heading` slot instead of the `heading` attribute for richer content, and `disabled` for a section that cannot be opened.

```html
<kern-accordion style="max-width:480px">
  <kern-accordion-item heading="Wi-Fi" open>
    <kern-kv>
      <kern-kv-item label="SSID">Haus</kern-kv-item>
      <kern-kv-item label="Mode">Static</kern-kv-item>
    </kern-kv>
  </kern-accordion-item>
  <kern-accordion-item>
    <span slot="heading">MQTT <kern-badge tone="ok">connected</kern-badge></span>
    <kern-kv><kern-kv-item label="Server" mono>192.168.1.5:1883</kern-kv-item></kern-kv>
  </kern-accordion-item>
  <kern-accordion-item heading="Cloud (Gen2+ only)" disabled>Not available.</kern-accordion-item>
</kern-accordion>
```
