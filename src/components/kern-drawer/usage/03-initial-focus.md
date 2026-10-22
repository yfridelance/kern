# Start in a field

When the panel opens, the focus goes to the first Kern field with `autofocus` (body or footer, also nested), once that field is ready; without one it lands on the close button. `kernOpen` fires after opening, for an app that picks the field itself. On close the focus returns to the opener.

```html
<kern-button class="open">Rename</kern-button>
<kern-drawer heading="Rename device">
  <kern-input label="Name" value="Bad Lüftung" autofocus></kern-input>
  <kern-input label="Room" value="Bad"></kern-input>
  <kern-button slot="footer" class="cancel">Cancel</kern-button>
  <kern-button slot="footer" variant="primary" class="save">Save</kern-button>
</kern-drawer>
```

```js
const drawer = root.querySelector('kern-drawer');
root.querySelector('.open').addEventListener('click', () => drawer.show());
root.querySelector('.cancel').addEventListener('click', () => drawer.close('cancel'));
root.querySelector('.save').addEventListener('click', () => drawer.close('save'));
```
