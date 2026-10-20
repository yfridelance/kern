# Undo action and persistent errors

`actionLabel` adds a button; the promise then resolves with `'action'` when it is clicked. `duration` is in milliseconds (default 5000, paused while hovered or focused); `0` keeps the toast until the user closes it, which suits errors. `danger` interrupts as an alert. All toasts share one live region; `setToastRegionLabel('Notifications')` sets its accessible name (default „Benachrichtigungen“).

```html
<div style="display:flex;flex-wrap:wrap;gap:12px">
  <kern-button class="undo">Remove 3 devices</kern-button>
  <kern-button class="err" variant="danger">Restart Küche Licht</kern-button>
</div>
<p class="out" style="font-size:13px;color:var(--text-muted)"></p>
```

```js
const { toast } = await import('../kern/index.esm.js');
root.querySelector('.undo').addEventListener('click', async () => {
  const reason = await toast({ message: '3 devices removed from «Garage».', actionLabel: 'Undo', duration: 8000 });
  root.querySelector('.out').textContent = `toast → ${reason}`;
});
root.querySelector('.err').addEventListener('click', () =>
  toast({ heading: 'Restart failed', message: 'Küche Licht does not respond (timeout).', tone: 'danger', duration: 0, closeLabel: 'Close' }));
```
