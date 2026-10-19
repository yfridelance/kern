# Links in text and tables

Use kern-link for navigation in running text, table cells and cards. `tone="muted"` is for secondary links; `disabled` keeps the text but removes the link.

```html
<p style="margin:0">
  12 snapshots, the latest from today 09:41. <kern-link href="#" tone="muted">Show all</kern-link><br>
  Open the device page of <kern-link href="#">Bad Lüftung</kern-link>, or
  <kern-link href="#" disabled>Garage Tor</kern-link> (reset, no page).
</p>
```
