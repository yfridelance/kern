# kern-topbar



<!-- Auto Generated Below -->


## Overview

App header: brand on the left, main navigation, tools on the right (site switch, server status,
kern-theme-toggle). Put each nav link directly into the `nav` slot; the active one gets
`aria-current="page"` or class `active` (e.g. Angular `routerLinkActive="active"`).

## Properties

| Property   | Attribute   | Description                                               | Type                  | Default             |
| ---------- | ----------- | --------------------------------------------------------- | --------------------- | ------------------- |
| `appName`  | `app-name`  |                                                           | `string \| undefined` | `undefined`         |
| `homeHref` | `home-href` | Link of the brand.                                        | `string`              | `'/'`               |
| `navLabel` | `nav-label` | Accessible name of the navigation.                        | `string`              | `'Hauptnavigation'` |
| `suite`    | `suite`     | Muted product family before the app name, e.g. "Homelab". | `string \| undefined` | `undefined`         |


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


