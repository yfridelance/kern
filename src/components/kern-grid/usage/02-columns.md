# Columns and spans

`columns` sets a fixed number of equal columns; `kern-grid-item` spans several. `span-sm`, `span-md` and `span-lg` change the span from 640, 960 and 1280 px **grid** width: here the list and the details are stacked on narrow grids and side by side (8 + 4 of 12) from 960 px.

```html
<kern-grid columns="12">
  <kern-grid-item span="12" span-md="8">
    <kern-card heading="Devices">
      <kern-list flush>
        <kern-list-item heading="Bad Lüftung" description="Shelly Plus 1 · 192.168.1.42"></kern-list-item>
        <kern-list-item heading="Küche Licht" description="Shelly Dimmer 2 · 192.168.1.43"></kern-list-item>
      </kern-list>
    </kern-card>
  </kern-grid-item>
  <kern-grid-item span="12" span-md="4">
    <kern-card heading="Details">
      <kern-kv>
        <kern-kv-item label="Firmware">1.4.4</kern-kv-item>
        <kern-kv-item label="Uptime">12 d</kern-kv-item>
      </kern-kv>
    </kern-card>
  </kern-grid-item>
</kern-grid>
```
