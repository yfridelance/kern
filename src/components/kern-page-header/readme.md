# kern-page-header



<!-- Auto Generated Below -->


## Overview

Page title (h1) with an optional description and the page actions on the right.
One `primary` button at most among the actions.

## Usage

### 01-basic

# Page title with actions

`heading` becomes the page's `h1`, `description` a muted line below it. Page actions go into the `actions` slot, with at most one `primary` button.

```html
<kern-page-header heading="Inventory" description="6 devices · 2 with a firmware update">
  <kern-button slot="actions">Export CSV</kern-button>
  <kern-button slot="actions" variant="primary">Start scan</kern-button>
</kern-page-header>
```


### 02-extra-content

# Status next to the heading

The default slot adds content after the heading, such as a badge or the device state.

```html
<kern-page-header heading="Bad Lüftung" description="Shelly Plus 1PM · 192.168.1.21">
  <kern-status tone="ok">Active</kern-status>
  <kern-badge mono>1.4.4</kern-badge>
  <kern-button slot="actions" variant="ghost">Snapshot</kern-button>
  <kern-button slot="actions" variant="primary">Update firmware</kern-button>
</kern-page-header>
```



## Properties

| Property               | Attribute     | Description | Type                  | Default     |
| ---------------------- | ------------- | ----------- | --------------------- | ----------- |
| `description`          | `description` |             | `string \| undefined` | `undefined` |
| `heading` _(required)_ | `heading`     |             | `string`              | `undefined` |


## Slots

| Slot        | Description                                     |
| ----------- | ----------------------------------------------- |
|             | Extra content after the heading (badge, status) |
| `"actions"` | Buttons                                         |


----------------------------------------------


