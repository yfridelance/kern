# Collapsing long paths

With `max-items` the middle entries fold into a „…“ menu that keeps the first and the last entries visible. Picking an entry clicks the original link, so app routers still handle it. `label-more` names the menu button.

```html
<kern-breadcrumb max-items="4" label="Path" label-more="More levels">
  <kern-link href="#">Haus Seeblick</kern-link>
  <kern-link href="#">Ground floor</kern-link>
  <kern-link href="#">Bath</kern-link>
  <kern-link href="#">Bad Lüftung</kern-link>
  <kern-link href="#">Settings</kern-link>
  <span>Wi-Fi</span>
</kern-breadcrumb>
```
