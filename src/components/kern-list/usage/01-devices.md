# Device list

`kern-list` holds `kern-list-item` rows. With `href` a row is a link, with `clickable` a button that emits `kernItemClick`, and `selected` marks the current row. The `start` slot takes a status or icon, `meta` a right-aligned value, `end` actions that never trigger the row.

```html
<kern-list label="Devices">
  <kern-list-item heading="Bathroom fan" description="Plus 1PM · 192.168.1.21" href="#bathroom-fan" selected>
    <kern-status slot="start" tone="ok"></kern-status>
    <kern-date slot="meta" relative data-ago="45"></kern-date>
  </kern-list-item>
  <kern-list-item heading="Shutter south" description="Pro 2PM · unreachable since yesterday" clickable>
    <kern-status slot="start" tone="warn"></kern-status>
    <kern-date slot="meta" relative data-ago="93000"></kern-date>
    <kern-button slot="end" size="sm" variant="ghost">Search again</kern-button>
  </kern-list-item>
  <kern-list-item heading="Firmware 1.4.4 available" description="3 devices" meta="Stable">
    <kern-button slot="end" size="sm">Update</kern-button>
  </kern-list-item>
</kern-list>
<p class="out" style="color:var(--text-muted);font-size:13px"></p>
```

```js
for (const el of root.querySelectorAll('kern-date[data-ago]')) el.value = Date.now() - el.dataset.ago * 1000;
const out = root.querySelector('.out');
root.querySelector('kern-list-item[clickable]').addEventListener('kernItemClick', () => (out.textContent = 'kernItemClick → Shutter south'));
root.querySelector('kern-list-item[clickable] kern-button').addEventListener('click', () => (out.textContent = 'Search again clicked (row not triggered)'));
```
