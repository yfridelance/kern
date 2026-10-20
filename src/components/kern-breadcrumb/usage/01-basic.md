# Path to the current page

Children are links (kern-link or `<a>`); the last child is the current page and gets `aria-current="page"`. A plain text element works for the last entry. `label` names the navigation.

```html
<kern-breadcrumb>
  <kern-link href="#">Haus Seeblick</kern-link>
  <kern-link href="#">Ground floor</kern-link>
  <kern-link href="#">Bath</kern-link>
  <span>Bad Lüftung</span>
</kern-breadcrumb>
```
