# Tones and sizes

Chips show active filters, chosen values or tags as small pills. `tone` colours them like kern-badge; `size="sm"` fits dense rows and table cells. Use kern-badge for fixed properties and kern-status for device states.

```html
<div style="display:grid;gap:12px">
  <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
    <kern-chip>Haus Seeblick</kern-chip>
    <kern-chip tone="accent">Kitchen</kern-chip>
    <kern-chip tone="ok">online</kern-chip>
    <kern-chip tone="warn">update</kern-chip>
    <kern-chip tone="danger">offline</kern-chip>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
    <kern-chip size="sm">Shelly Plus 1PM</kern-chip>
    <kern-chip size="sm" tone="accent">Gen3</kern-chip>
    <kern-chip size="sm" removable>Büro Bern</kern-chip>
  </div>
</div>
```
