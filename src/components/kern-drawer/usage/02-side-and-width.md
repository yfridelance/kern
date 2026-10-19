# Filters from the start edge

`side="start"` slides the panel in from the left (in left-to-right layouts), `width` sets its width in px. With `dismissible="false"` neither Escape, × nor the backdrop close it — the footer buttons must.

```html
<kern-button class="open"><kern-icon slot="start" name="filter"></kern-icon>Filter</kern-button>
<kern-drawer heading="Filter devices" side="start" width="320" dismissible="false">
  <div style="display:grid;gap:12px">
    <kern-checkbox checked>Active</kern-checkbox>
    <kern-checkbox>Missing</kern-checkbox>
    <kern-checkbox>Firmware update only</kern-checkbox>
  </div>
  <kern-button slot="footer" class="reset" variant="ghost">Reset</kern-button>
  <kern-button slot="footer" class="apply" variant="primary">Apply</kern-button>
</kern-drawer>
```

```js
const drawer = root.querySelector('kern-drawer');
root.querySelector('.open').addEventListener('click', () => drawer.show());
root.querySelector('.reset').addEventListener('click', () => drawer.close('reset'));
root.querySelector('.apply').addEventListener('click', () => drawer.close('apply'));
```
