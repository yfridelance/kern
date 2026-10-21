# Commands and config files

A code block with copy button, highlighted for `shell`, `powershell`, `yaml`, `json`, `js`/`ts`, `ini`, `html`, `ruby` and `go`. The code is the text content; common indentation is removed, so it can be indented with the HTML. `heading` shows a title such as a file name.

```html
<div style="display:grid;gap:16px">
  <kern-code language="shell" heading="Reboot a device">
    # Reboot via the RPC API
    curl -X POST "http://${IP:-192.168.1.21}/rpc/Shelly.Reboot" \
      -d '{"delay_ms": 500}'
  </kern-code>
  <kern-code language="json" heading="Shelly.GetStatus (excerpt)">
    {
      "wifi": { "sta_ip": "192.168.1.21", "rssi": -63 },
      "sys": { "uptime": 356420, "ram_free": 98764 },
      "cloud": { "connected": false }
    }
  </kern-code>
</div>
```
