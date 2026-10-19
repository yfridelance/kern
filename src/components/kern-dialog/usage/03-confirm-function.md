# confirm()

`confirm()`, imported from `'@yfridelance/kern'`, builds the dialog for you and resolves `true` on confirm, `false` otherwise. `danger` styles the confirm button; with `typeToConfirm` it stays disabled until that text (e.g. the MAC) is typed.

```html
<div style="display:flex;flex-wrap:wrap;gap:12px">
  <kern-button class="restart">Restart Bad Lüftung</kern-button>
  <kern-button class="reset" variant="danger">Factory reset …</kern-button>
</div>
<p class="out" style="font-size:13px;color:var(--text-muted)"></p>
```

```js
const { confirm } = await import('../kern/index.esm.js');
const out = root.querySelector('.out');
root.querySelector('.restart').addEventListener('click', async () => {
  const ok = await confirm({ heading: 'Restart Bad Lüftung?', message: 'The fan stops for about 10 seconds.', confirmLabel: 'Restart', cancelLabel: 'Cancel' });
  out.textContent = `confirm → ${ok}`;
});
root.querySelector('.reset').addEventListener('click', async () => {
  const ok = await confirm({
    heading: 'Factory reset «Küche Licht»',
    message: 'The device starts in AP mode afterwards.',
    confirmLabel: 'Reset',
    cancelLabel: 'Cancel',
    danger: true,
    typeToConfirm: 'A4CF12F45B21',
    typeToConfirmLabel: 'Type the MAC A4CF12F45B21 to confirm',
  });
  out.textContent = `confirm → ${ok}`;
});
```
