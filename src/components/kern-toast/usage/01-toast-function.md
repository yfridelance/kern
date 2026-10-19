# Showing a toast

Usually you call `toast()`, imported from `'@yfridelance/kern'`. It stacks toasts at the bottom right (at most four), announces them through a polite live region and resolves with the reason the toast closed: `'timeout'`, `'close'` or `'action'`. A plain string works as the message.

```html
<div style="display:flex;flex-wrap:wrap;gap:12px">
  <kern-button class="ok">Save snapshot</kern-button>
  <kern-button class="info">Plain message</kern-button>
</div>
```

```js
const { toast } = await import('../kern/index.esm.js');
root.querySelector('.ok').addEventListener('click', () =>
  toast({ message: 'Snapshot of «Bad Lüftung» saved.', tone: 'ok' }));
root.querySelector('.info').addEventListener('click', () =>
  toast('Scan of 192.168.1.0/24 started.'));
```
