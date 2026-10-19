# Row actions

Put the trigger into the `trigger` slot — usually an `icon-only` kern-button with `label` — and kern-menu-item elements into the menu, with `<hr>` as separator. `icon` adds a glyph, `tone="danger"` marks destructive actions and `disabled` greys an item out. Picking one emits `kernSelect` with the item's `value`.

```html
<kern-menu align="start" label="Actions for Rollladen Süd">
  <kern-button slot="trigger" variant="ghost" icon-only label="More actions"><kern-icon name="more"></kern-icon></kern-button>
  <kern-menu-item value="reboot" icon="power">Restart</kern-menu-item>
  <kern-menu-item value="refresh" icon="refresh">Query status</kern-menu-item>
  <kern-menu-item value="edit" icon="edit">Rename</kern-menu-item>
  <hr>
  <kern-menu-item value="reset" icon="warn" tone="danger">Factory reset</kern-menu-item>
  <kern-menu-item value="delete" icon="trash" disabled>Delete</kern-menu-item>
</kern-menu>
<p class="out" style="font-size:13px;color:var(--text-muted)">Pick an action.</p>
```

```js
root.querySelector('kern-menu').addEventListener('kernSelect', (e) => {
  root.querySelector('.out').textContent = `kernSelect → ${e.detail.value}`;
});
```
