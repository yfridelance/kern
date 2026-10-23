# Details

The `details` slot takes longer content, such as a kern-kv or a log excerpt. With `collapsible` it sits behind a “Show details” button (`aria-expanded`, Enter or Space), so the history stays short; `open` shows it from the start and `kernToggle` reports `{ open }`. Actions stay visible either way.

```html
<kern-timeline label="Update history">
  <kern-timeline-item heading="Firmware updated" tone="ok" icon="download" datetime="2026-10-21T06:30:00Z" collapsible>
    Version 1.4.2 was installed.
    <kern-kv slot="details">
      <kern-kv-item label="Before" mono>1.3.9</kern-kv-item>
      <kern-kv-item label="After" mono>1.4.2</kern-kv-item>
      <kern-kv-item label="Duration">2 min 14 s</kern-kv-item>
    </kern-kv>
    <kern-button slot="actions" size="sm" variant="ghost">Open update log</kern-button>
  </kern-timeline-item>
  <kern-timeline-item heading="Update failed" tone="danger" icon="download" status="Failed" datetime="2026-10-20T06:30:00Z" collapsible open>
    The download stopped at 63 %.
    <kern-code slot="details" wrap code="06:31:02 download 63 % (1.2 MB of 1.9 MB)&#10;06:31:32 timeout after 30 s, update cancelled"></kern-code>
    <kern-button slot="actions" size="sm">Try again</kern-button>
  </kern-timeline-item>
</kern-timeline>
<p class="out" style="color:var(--text-muted);font-size:13px"></p>
```

```js
const out = root.querySelector('.out');
root.querySelector('kern-timeline').addEventListener('kernToggle', (e) => (out.textContent = `kernToggle → ${JSON.stringify(e.detail)}`));
```
