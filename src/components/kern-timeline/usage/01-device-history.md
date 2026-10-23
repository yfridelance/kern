# Device history

`kern-timeline` shows what happened to a device, in the order the app gives the events: here newest first. Each `kern-timeline-item` has a `heading`, a `datetime` and a `tone` whose marker has its own shape (ok = circle, warn = diamond, danger = square), so the tone does not depend on colour. The heading says what happened; `status` adds the state as a word. The default slot holds a short description, `actions` the buttons that help.

```html
<kern-timeline label="History of Bathroom fan">
  <kern-timeline-item heading="Back online" tone="ok" icon="wifi" status="Online" relative data-ago="600">
    Reconnected after 42 minutes.
  </kern-timeline-item>
  <kern-timeline-item heading="Connection lost" tone="danger" icon="wifi" status="Offline" relative data-ago="3120">
    No response from 192.168.1.21.
    <kern-button slot="actions" size="sm" variant="ghost">Show log</kern-button>
  </kern-timeline-item>
  <kern-timeline-item heading="Firmware updated" tone="ok" icon="download" relative data-ago="86400">
    Version 1.4.2 was installed.
  </kern-timeline-item>
  <kern-timeline-item heading="Signal weak" tone="warn" relative data-ago="259200">
    −78 dBm for more than an hour.
  </kern-timeline-item>
  <kern-timeline-item heading="Device discovered" icon="search" relative data-ago="1209600">
    Shelly Plus 1PM, added to Bathroom.
  </kern-timeline-item>
</kern-timeline>
```

```js
for (const el of root.querySelectorAll('[data-ago]')) el.datetime = Date.now() - el.dataset.ago * 1000;
```
