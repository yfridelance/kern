# Local search

Give the palette all `items` and it searches them itself: every word must occur in the label, a keyword or the group (case and diacritics ignored, so «kuche» finds «Küche Licht»). Label matches rank first and are highlighted; `keywords` make an IP, a MAC or a synonym findable without showing it. Groups appear in the order of their first entry.

Open it with a button calling `show()`, or with Ctrl+K / Cmd+K: `shortcut` is off by default, so enable it on one palette per page. Arrow keys, Home and End move the active entry (disabled ones are skipped), Enter or a click chooses, Escape or a click on the backdrop closes, and the focus returns to where it was.

`kernSelect` reports only the `id`; the palette is already closed. Navigating, permissions and running the action are up to your app, and dangerous actions go through its usual confirmation, here `confirm()`.

```html
<kern-button class="open">
  <kern-icon name="search" slot="start"></kern-icon>
  Search <kbd aria-hidden="true" style="margin-left:8px;font:12px var(--font-mono);color:var(--text-muted)">Ctrl K</kbd>
</kern-button>
<p class="out" style="font-size:13px;color:var(--text-muted)"></p>
<kern-command-palette shortcut></kern-command-palette>
```

```js
const { confirm } = await import('../kern/index.esm.js');
const palette = root.querySelector('kern-command-palette');
const out = root.querySelector('.out');
if (/Mac|iPhone|iPad/.test(navigator.platform)) root.querySelector('kbd').textContent = '⌘K';
palette.items = [
  { id: 'page-devices', label: 'Devices', group: 'Pages', icon: 'home', description: 'All devices of Haus Seeblick' },
  { id: 'page-updates', label: 'Updates', group: 'Pages', icon: 'download', keywords: ['firmware'] },
  { id: 'page-settings', label: 'Settings', group: 'Pages', icon: 'settings' },
  { id: 'dev-bath', label: 'Bad Lüftung', group: 'Devices', icon: 'wifi', description: 'Shelly Plus 1PM · 192.168.1.21', keywords: ['192.168.1.21', 'fan'] },
  { id: 'dev-kitchen', label: 'Küche Licht', group: 'Devices', icon: 'bulb', description: 'Shelly 1 Mini Gen3 · 192.168.1.22', keywords: ['192.168.1.22'] },
  { id: 'dev-shutter', label: 'Rollladen Süd', group: 'Devices', icon: 'wifi', description: 'Shelly Plus 2PM · offline', keywords: ['192.168.1.23', 'blind'] },
  { id: 'act-scan', label: 'Start network scan', group: 'Actions', icon: 'search' },
  { id: 'act-restart', label: 'Restart Küche Licht', group: 'Actions', icon: 'power' },
  { id: 'act-reset', label: 'Factory reset Rollladen Süd', group: 'Actions', icon: 'trash', description: 'Device is offline', disabled: true },
];
root.querySelector('.open').addEventListener('click', () => palette.show());
palette.addEventListener('kernSelect', async (e) => {
  const { id } = e.detail;
  if (id === 'act-restart') {
    const ok = await confirm({ heading: 'Restart Küche Licht?', message: 'The light is unreachable for about 10 seconds.', confirmLabel: 'Restart' });
    out.textContent = ok ? 'Restarting Küche Licht …' : 'Restart cancelled';
    return;
  }
  // Your router or action handler takes over here.
  out.textContent = `kernSelect → ${id}`;
});
```
