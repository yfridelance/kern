# Page title with actions

`heading` becomes the page's `h1`, `description` a muted line below it. Page actions go into the `actions` slot, with at most one `primary` button.

```html
<kern-page-header heading="Inventory" description="6 devices · 2 with a firmware update">
  <kern-button slot="actions">Export CSV</kern-button>
  <kern-button slot="actions" variant="primary">Start scan</kern-button>
</kern-page-header>
```
