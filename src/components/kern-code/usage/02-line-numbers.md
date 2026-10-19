# Line numbers and height

`line-numbers` numbers the lines and `max-height` scrolls longer code. `wrap` wraps long lines instead of scrolling sideways.

```html
<div style="display:grid;gap:16px">
  <kern-code language="yaml" heading="configuration.yaml" line-numbers max-height="160px">
    mqtt:
      broker: "192.168.1.5"
      port: 1883
      discovery: true   # create devices automatically
    shelly:
      - host: 192.168.1.21
        name: Bathroom fan
      - host: 192.168.1.34
        name: Kitchen light
  </kern-code>
  <kern-code language="ini" heading="shelly-poller.service" line-numbers>
    [Unit]
    Description=Poll Shelly devices every 30 s
    After=network-online.target

    [Service]
    ExecStart=/usr/local/bin/shelly-poller --interval 30
    Restart=on-failure
  </kern-code>
  <kern-code language="ts" heading="poll.ts" wrap>
    const res = await fetch(`http://${ip}/rpc/Switch.GetStatus?id=0`, { signal: AbortSignal.timeout(3000) });
    const { apower, output } = await res.json(); // watts, on/off
  </kern-code>
</div>
```
