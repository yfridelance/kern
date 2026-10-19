# Keyboard

Enter, Space or Arrow Down open the menu at the first item, Arrow Up at the last. Arrow keys, Home and End move between items, a letter jumps to the next item starting with it. Enter picks, Escape or Tab closes, and the focus returns to the trigger. `show()` and `hide()` open and close it from script.

```html
<div style="display:flex;gap:12px;align-items:center">
  <kern-menu label="Firmware channel">
    <kern-button slot="trigger">Channel</kern-button>
    <kern-menu-item value="stable">Stable</kern-menu-item>
    <kern-menu-item value="beta">Beta</kern-menu-item>
    <kern-menu-item value="dev" disabled>Development</kern-menu-item>
  </kern-menu>
  <kern-button class="open" variant="ghost">Open with show()</kern-button>
</div>
```

```js
root.querySelector('.open').addEventListener('click', () => root.querySelector('kern-menu').show());
```
