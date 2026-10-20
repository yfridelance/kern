# Device details

A modal side panel for details and longer forms. Open it with `show()`, close it with `close(returnValue)`; Escape, × and a backdrop click close it with `cancel`. `kernClose` reports the `returnValue`. Footer buttons: cancel first, confirm last.

```html
<kern-button class="open">Details</kern-button>
<p class="out" style="font-size:13px;color:var(--text-muted)"></p>
<kern-drawer heading="Bad Lüftung">
  <kern-kv>
    <kern-kv-item label="Model">Shelly Plus 1PM</kern-kv-item>
    <kern-kv-item label="IP"><kern-copy>192.168.1.21</kern-copy></kern-kv-item>
    <kern-kv-item label="Firmware" mono>1.4.4</kern-kv-item>
  </kern-kv>
  <kern-input label="Name" value="Bad Lüftung"></kern-input>
  <kern-ip-input label="Static IP" allow="single" value="192.168.1.21"></kern-ip-input>
  <kern-step-input label="Auto-off" value="15" min="0" max="120" unit="min"></kern-step-input>
  <kern-button slot="footer" class="cancel">Cancel</kern-button>
  <kern-button slot="footer" variant="primary" class="save">Save</kern-button>
</kern-drawer>
```

```js
const drawer = root.querySelector('kern-drawer');
root.querySelector('.open').addEventListener('click', () => drawer.show());
root.querySelector('.cancel').addEventListener('click', () => drawer.close('cancel'));
root.querySelector('.save').addEventListener('click', () => drawer.close('save'));
drawer.addEventListener('kernClose', (e) => (root.querySelector('.out').textContent = `kernClose → ${e.detail.returnValue}`));
```
