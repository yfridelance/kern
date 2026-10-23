# Loading and empty

While `loading` is set and there are no events yet, placeholders in the shape of events show (hidden from screen readers; the list is `aria-busy`). Without events the timeline shows a compact empty state with the `empty` heading. Put your own `kern-empty-state` in the `empty` slot for errors, with an action to try again.

```html
<kern-timeline class="loading" loading></kern-timeline>
<kern-timeline empty="No events in the last 30 days" style="margin-top:var(--space-5)"></kern-timeline>
<kern-timeline style="margin-top:var(--space-5)">
  <kern-empty-state slot="empty" variant="error" compact>
    The history could not be loaded.
    <kern-button slot="actions" size="sm">Try again</kern-button>
  </kern-empty-state>
</kern-timeline>
```
