# Navigation

`variant="nav"` turns the list into a side navigation: compact rows without lines or box and a rounded hover. `heading` adds a visible group title that also names the list; several nav lists in a row form groups. `current` marks the link to the open page with `aria-current="page"` (`selected` stays `aria-current="true"` for a chosen row in a normal list). Icons go into the `start` slot, counters into `meta` as `kern-badge mono`.

```html
<div style="width:240px">
  <kern-list variant="nav" heading="Home">
    <kern-list-item heading="Overview" href="#overview" current><kern-icon slot="start" name="home"></kern-icon></kern-list-item>
    <kern-list-item heading="Devices" href="#devices">
      <kern-icon slot="start" name="power"></kern-icon>
      <kern-badge slot="meta" mono>38</kern-badge>
    </kern-list-item>
    <kern-list-item heading="Lights" href="#lights"><kern-icon slot="start" name="bulb"></kern-icon></kern-list-item>
  </kern-list>
  <kern-list variant="nav" heading="System">
    <kern-list-item heading="Updates" href="#updates">
      <kern-icon slot="start" name="refresh"></kern-icon>
      <kern-badge slot="meta" mono tone="accent">3</kern-badge>
    </kern-list-item>
    <kern-list-item heading="Settings" href="#settings"><kern-icon slot="start" name="settings"></kern-icon></kern-list-item>
  </kern-list>
</div>
```

```js
// Demo only: move `current` instead of following the links.
root.addEventListener('kernNavigate', (e) => {
  e.preventDefault();
  for (const el of root.querySelectorAll('kern-list-item[current]')) el.current = false;
  e.target.current = true;
});
```
