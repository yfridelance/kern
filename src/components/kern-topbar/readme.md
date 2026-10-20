# kern-topbar



<!-- Auto Generated Below -->


## Overview

App header: brand on the left, main navigation, tools on the right (site switch, server status,
kern-theme-toggle). Put each nav link directly into the `nav` slot; the active one gets
`aria-current="page"` or class `active` (e.g. Angular `routerLinkActive="active"`).

## Usage

### 01-basic

# App header

Brand on the left, the main navigation in the `nav` slot and tools in the `end` slot. Mark the current link with `aria-current="page"`; keep the navigation to at most six links.

```html
<kern-topbar app-name="Shelly Manager" suite="Homelab">
  <a slot="nav" href="#">Scan</a>
  <a slot="nav" href="#" aria-current="page">Inventory</a>
  <a slot="nav" href="#">Templates</a>
  <a slot="nav" href="#">Log</a>
  <kern-status slot="end" tone="ok">Server connected</kern-status>
  <kern-theme-toggle slot="end" small label-light="Switch to light theme" label-dark="Switch to dark theme"></kern-theme-toggle>
</kern-topbar>
```


### 02-custom-brand

# Custom brand and site switch

The `brand` slot replaces the default mark and app name. A small kern-select in the `end` slot switches between sites.

```html
<kern-topbar home-href="#">
  <a slot="brand" href="#" style="display:flex;align-items:center;gap:8px;color:inherit;text-decoration:none;font-weight:600">
    <kern-icon name="home"></kern-icon> Haus Seeblick
  </a>
  <a slot="nav" href="#" aria-current="page">Devices</a>
  <a slot="nav" href="#">Rooms</a>
  <kern-select slot="end" size="sm" aria-label-text="Choose site" style="width:180px">
    <option value="1">Haus Seeblick</option>
    <option value="2">Holiday flat</option>
    <option value="3">Office Bern</option>
  </kern-select>
  <kern-status slot="end" tone="warn">2 updates</kern-status>
</kern-topbar>
```



## Properties

| Property   | Attribute   | Description                                               | Type                  | Default     |
| ---------- | ----------- | --------------------------------------------------------- | --------------------- | ----------- |
| `appName`  | `app-name`  |                                                           | `string \| undefined` | `undefined` |
| `homeHref` | `home-href` | Link of the brand.                                        | `string`              | `'/'`       |
| `navLabel` | `nav-label` | Accessible name of the navigation.                        | `string \| undefined` | `undefined` |
| `suite`    | `suite`     | Muted product family before the app name, e.g. "Homelab". | `string \| undefined` | `undefined` |


## Slots

| Slot      | Description                                         |
| --------- | --------------------------------------------------- |
| `"brand"` | Replaces the default brand (mark + `app-name`)      |
| `"end"`   | Tools, right-aligned                                |
| `"nav"`   | `<a>` elements of the main navigation (at most six) |


## Shadow Parts

| Part    | Description    |
| ------- | -------------- |
| `"bar"` | The header bar |


----------------------------------------------


