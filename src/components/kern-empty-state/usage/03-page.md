# Whole page section

The heading is plain text, so a state inside a table or card does not add to the page outline. When the state stands in for a whole section of the page, `heading-level` exposes the heading to screen readers as a heading of that level; it looks the same.

```html
<kern-empty-state heading-level="2" icon="wifi" heading="No devices found yet">
  Kern searches 192.168.1.0/24. Check that the devices are in the same network, or enter another IP range.
  <kern-button slot="actions" variant="primary">Scan again</kern-button>
  <kern-button slot="actions">Change IP range</kern-button>
</kern-empty-state>
```
