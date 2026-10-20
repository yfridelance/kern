# With a side navigation

Content in the `sidebar` slot stands on the left from `breakpoint` (960 px of shell width; 700 px here, so the example shows both states when you resize the window). Below it the side navigation is a drawer: kern-topbar gets a menu button that opens it, Escape and the backdrop close it, and a click on a link closes it too. In both layouts the slot sits in a `<nav>` landmark.

Build the navigation from `kern-list variant="nav"`, one list per group with a `heading`. Icons go into the `start` slot of kern-list-item, counters into `meta` as `kern-badge mono`, and `current` marks the open page (`aria-current="page"`). A link click emits `kernNavigate`; call `preventDefault()` there to route in your app, move `current` and call `focusMain()`; Fundamentals › Layout › Navigation has the details.

```html
<kern-app-shell breakpoint="700" style="min-height:460px">
  <kern-topbar slot="topbar" app-name="Shelly Manager">
    <kern-language-select slot="end" size="sm" value="en" languages="en,de" display="code"></kern-language-select>
  </kern-topbar>
  <div slot="sidebar">
    <kern-list variant="nav" heading="Home">
      <kern-list-item heading="Overview" href="#overview" current><kern-icon slot="start" name="home"></kern-icon></kern-list-item>
      <kern-list-item heading="Devices" href="#devices">
        <kern-icon slot="start" name="power"></kern-icon>
        <kern-badge slot="meta" mono>38</kern-badge>
      </kern-list-item>
      <kern-list-item heading="Lights" href="#lights"><kern-icon slot="start" name="bulb"></kern-icon></kern-list-item>
      <kern-list-item heading="Climate" href="#climate"><kern-icon slot="start" name="thermometer"></kern-icon></kern-list-item>
    </kern-list>
    <kern-list variant="nav" heading="System">
      <kern-list-item heading="Updates" href="#updates">
        <kern-icon slot="start" name="refresh"></kern-icon>
        <kern-badge slot="meta" mono tone="accent">3</kern-badge>
      </kern-list-item>
      <kern-list-item heading="Network" href="#network"><kern-icon slot="start" name="wifi"></kern-icon></kern-list-item>
      <kern-list-item heading="Settings" href="#settings"><kern-icon slot="start" name="settings"></kern-icon></kern-list-item>
    </kern-list>
  </div>
  <kern-page-header heading="Overview"></kern-page-header>
  <kern-grid columns="12">
    <kern-grid-item span="12" span-md="8"><kern-card heading="Devices">36 of 38 online</kern-card></kern-grid-item>
    <kern-grid-item span="12" span-md="4"><kern-card heading="Updates">3 available</kern-card></kern-grid-item>
  </kern-grid>
</kern-app-shell>
```

```js
// A tiny router: mark the link as current, show its page, focus the content.
const shell = root.querySelector('kern-app-shell');
root.addEventListener('kernNavigate', (e) => {
  e.preventDefault();
  const item = e.target;
  for (const el of shell.querySelectorAll('kern-list-item[current]')) el.current = false;
  item.current = true;
  shell.querySelector('kern-page-header').heading = item.heading;
  shell.focusMain(); // keyboard and screen reader users continue in the new content
});
```
