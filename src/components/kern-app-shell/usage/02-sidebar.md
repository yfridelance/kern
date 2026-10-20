# With a side navigation

Content in the `sidebar` slot stands on the left from `breakpoint` (960 px of shell width; 700 px here, so the example shows both states when you resize the window). Below it the side navigation is a drawer: kern-topbar gets a menu button that opens it, Escape and the backdrop close it, and a click on a link closes it too.

```html
<kern-app-shell breakpoint="700" style="min-height:420px">
  <kern-topbar slot="topbar" app-name="Shelly Manager">
    <kern-language-select slot="end" size="sm" value="en" languages="en,de" display="code"></kern-language-select>
  </kern-topbar>
  <kern-list slot="sidebar" flush>
    <kern-list-item heading="Overview" href="#"></kern-list-item>
    <kern-list-item heading="Devices" href="#"></kern-list-item>
    <kern-list-item heading="Rooms" href="#"></kern-list-item>
    <kern-list-item heading="Updates" href="#"></kern-list-item>
    <kern-list-item heading="Settings" href="#"></kern-list-item>
  </kern-list>
  <kern-page-header heading="Overview"></kern-page-header>
  <kern-grid columns="12">
    <kern-grid-item span="12" span-md="8"><kern-card heading="Devices">36 of 38 online</kern-card></kern-grid-item>
    <kern-grid-item span="12" span-md="4"><kern-card heading="Updates">3 available</kern-card></kern-grid-item>
  </kern-grid>
</kern-app-shell>
```

```js
// Demo only: keep the page instead of following the links.
root.addEventListener('kernNavigate', (e) => e.preventDefault());
```
