# External links and downloads

`external` opens the link in a new tab with `rel="noopener noreferrer"`, shows ↗ and reads `label-external` to screen readers. `download` saves the target instead of navigating, optionally under the given file name.

```html
<p style="margin:0;display:grid;gap:8px">
  <span>Web UI: <kern-link href="http://192.168.1.21" external label-external="opens in a new tab">192.168.1.21</kern-link></span>
  <span>Backup: <kern-link href="data:application/json,%7B%22name%22%3A%22Bad%20L%C3%BCftung%22%7D" download="bad-lueftung.json">bad-lueftung.json</kern-link></span>
</p>
```
