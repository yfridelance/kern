# Start in a field

`autofocus` on a Kern field moves the focus there when the dialog opens, instead of to the close button. Native controls with `autofocus` work as in a plain `<dialog>`. `kernOpen` fires after opening; without `autofocus`, set the focus there with the field's `setFocus()`.

```html
<kern-button class="open">Add scene …</kern-button>
<kern-dialog heading="Add scene">
  <kern-input label="Name" placeholder="Evening" autofocus></kern-input>
  <kern-button slot="footer" class="cancel">Cancel</kern-button>
  <kern-button slot="footer" variant="primary" class="ok">Add</kern-button>
</kern-dialog>
```

```js
const dialog = root.querySelector('kern-dialog');
root.querySelector('.open').addEventListener('click', () => dialog.show());
root.querySelector('.cancel').addEventListener('click', () => dialog.close('cancel'));
root.querySelector('.ok').addEventListener('click', () => dialog.close('ok'));
```
