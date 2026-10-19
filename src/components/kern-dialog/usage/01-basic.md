# Confirmation dialog

A modal dialog on the native `<dialog>`: `show()` opens it, `close(returnValue)` closes it and `kernClose` reports the value. Escape and × close it unless `dismissible="false"`. Footer buttons: cancel first, confirm last.

```html
<kern-button class="open">Restart …</kern-button>
<p class="out" style="font-size:13px;color:var(--text-muted)"></p>
<kern-dialog heading="Restart Küche Licht?" close-label="Close">
  <p>Küche Licht will be unreachable for about 10 seconds.</p>
  <kern-button slot="footer" class="cancel">Cancel</kern-button>
  <kern-button slot="footer" variant="primary" class="ok">Restart</kern-button>
</kern-dialog>
```

```js
const dialog = root.querySelector('kern-dialog');
root.querySelector('.open').addEventListener('click', () => dialog.show());
root.querySelector('.cancel').addEventListener('click', () => dialog.close('cancel'));
root.querySelector('.ok').addEventListener('click', () => dialog.close('ok'));
dialog.addEventListener('kernClose', (e) => (root.querySelector('.out').textContent = `kernClose → ${e.detail.returnValue}`));
```
