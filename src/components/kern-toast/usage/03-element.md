# The element itself

kern-toast can also be placed directly, e.g. in a custom container. It closes itself after `duration`, with × (`close-label`) or the action, emitting `kernAction` and `kernClose` with the `reason`. Here `duration="0"` keeps them on the page.

```html
<div style="display:grid;gap:8px;max-width:380px">
  <kern-toast tone="ok" duration="0" close-label="Close">Snapshot of «Bad Lüftung» saved.</kern-toast>
  <kern-toast tone="warn" heading="Update available" action-label="Install" duration="0" close-label="Close">Firmware 1.4.4 for 3 devices.</kern-toast>
</div>
<p class="out" style="font-size:13px;color:var(--text-muted)"></p>
```

```js
for (const t of root.querySelectorAll('kern-toast')) {
  t.addEventListener('kernClose', (e) => (root.querySelector('.out').textContent = `kernClose → ${e.detail.reason}`));
}
```
