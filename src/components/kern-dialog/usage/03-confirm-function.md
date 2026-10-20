# confirm()

`confirm()`, imported from `'@yfridelance/kern'`, builds the dialog for you and resolves `true` on confirm, `false` otherwise. `danger` styles the confirm button; with `typeToConfirm` it stays disabled until that text (e.g. the MAC) is typed. Pass an array to accept any one of several answers, e.g. the device name or its MAC.

The typed text and every alternative go through `normalize` before comparing: by default `trim()` and upper case. `normalize: 'mac'` accepts a MAC in any notation (`A8:03:2A:B1:23:45`, `a8-03-2a-b1-23-45`, `A8032AB12345`) and treats other text like the default; your own `(text) => string` works too. The default label lists all alternatives («Type “Boiler” or “A8:03:2A:B1:23:45” to confirm» in the Kern language, MACs formatted with `'mac'`); `typeToConfirmLabel` overrides it.

```html
<div style="display:flex;flex-wrap:wrap;gap:12px">
  <kern-button class="restart">Restart Bad Lüftung</kern-button>
  <kern-button class="reset" variant="danger">Factory reset …</kern-button>
  <kern-button class="delete" variant="danger">Delete Boiler …</kern-button>
</div>
<p class="out" style="font-size:13px;color:var(--text-muted)"></p>
```

```js
const { confirm } = await import('../kern/index.esm.js');
const out = root.querySelector('.out');
root.querySelector('.restart').addEventListener('click', async () => {
  const ok = await confirm({ heading: 'Restart Bad Lüftung?', message: 'The fan stops for about 10 seconds.', confirmLabel: 'Restart' });
  out.textContent = `confirm → ${ok}`;
});
root.querySelector('.reset').addEventListener('click', async () => {
  const ok = await confirm({
    heading: 'Factory reset «Küche Licht»',
    message: 'The device starts in AP mode afterwards.',
    confirmLabel: 'Reset',
    danger: true,
    typeToConfirm: 'A4CF12F45B21',
    typeToConfirmLabel: 'Type the MAC A4CF12F45B21 to confirm',
  });
  out.textContent = `confirm → ${ok}`;
});
root.querySelector('.delete').addEventListener('click', async () => {
  // Name or MAC, the MAC in any notation (a8-03-2a-b1-23-45, A8032AB12345 …).
  const ok = await confirm({
    heading: 'Delete «Boiler»?',
    confirmLabel: 'Delete',
    danger: true,
    typeToConfirm: ['Boiler', 'a8032ab12345'],
    normalize: 'mac',
  });
  out.textContent = `confirm → ${ok}`;
});
```
