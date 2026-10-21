# Variants

`variant` picks the icon and the default heading: `empty` when nothing was created yet, `no-results` when filters or a search match nothing, `error` when the data could not be loaded. The default slot holds one or two sentences, the `actions` slot the buttons that get the user going again. Only `error` is announced (once, as status).

```html
<div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
  <kern-card>
    <kern-empty-state>
      Add a device or scan the network to find Shelly devices.
      <kern-button slot="actions" variant="primary">Add device</kern-button>
      <kern-button slot="actions">Scan network</kern-button>
    </kern-empty-state>
  </kern-card>
  <kern-card>
    <kern-empty-state variant="no-results">
      No device matches “garage” at Haus Seeblick.
      <kern-button slot="actions">Reset filters</kern-button>
    </kern-empty-state>
  </kern-card>
  <kern-card>
    <kern-empty-state variant="error">
      The server did not answer (timeout).
      <kern-button slot="actions">Try again</kern-button>
    </kern-empty-state>
  </kern-card>
</div>
```
