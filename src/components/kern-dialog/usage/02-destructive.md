# Destructive action

The heading names the action and the device, a kern-alert with `tone="warn"` states the consequence, and the confirm button is `variant="danger"` with a verb. `width` sets the panel width in px.

```html
<kern-button class="open" variant="danger">Factory reset …</kern-button>
<kern-dialog heading="Factory reset «Küche Licht»" width="440">
  <kern-alert tone="warn">The device loses its configuration and starts in AP mode.</kern-alert>
  <kern-button slot="footer" class="cancel">Cancel</kern-button>
  <kern-button slot="footer" variant="danger" class="ok">Reset</kern-button>
</kern-dialog>
```

```js
const dialog = root.querySelector('kern-dialog');
root.querySelector('.open').addEventListener('click', () => dialog.show());
root.querySelector('.cancel').addEventListener('click', () => dialog.close('cancel'));
root.querySelector('.ok').addEventListener('click', () => dialog.close('reset'));
```
