# From a JSON string

A string in the `data` attribute is parsed as JSON when possible, so short values can be written directly in HTML. `open-depth="2"` opens nested objects too.

```html
<kern-json open-depth="2" data='{"wifi":{"rssi":-63,"ssid":"Home","sta_ip":"192.168.1.21"},"uptime":356420,"ram_free":98764,"cloud":{"connected":false}}'></kern-json>
```
