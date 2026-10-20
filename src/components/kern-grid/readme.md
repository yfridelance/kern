# kern-grid



<!-- Auto Generated Below -->


## Overview

Lays out cards, tiles and form groups in columns. Without `columns` it fits as many columns of at least `min` as
there is room for, without breakpoints. With `columns` it has a fixed number of equal columns; `columns-sm`,
`columns-md` and `columns-lg` change it from 640, 960 and 1280 px, and `kern-grid-item` children span several.

Breakpoints are measured on the grid itself (container queries), not on the window, so a grid in a sidebar, a
drawer or half a page switches by the room it really has.

## Usage

### 01-auto

# Tiles

Without `columns` the grid fits as many columns of at least `min` as there is room for, without breakpoints. Here at least 180 px; resize the window to see it reflow.

```html
<kern-grid min="180px" gap="sm">
  <kern-stat label="Devices online" value="36" unit="/ 38" delta="2" trend="down" meta="missing"></kern-stat>
  <kern-stat label="Updates" value="3" meta="available · Stable"></kern-stat>
  <kern-stat label="Errors (24 h)" value="5" delta="+3" trend="up" invert></kern-stat>
  <kern-stat label="Power" value="1’284" unit="W"></kern-stat>
</kern-grid>
```


### 02-columns

# Columns and spans

`columns` sets a fixed number of equal columns; `kern-grid-item` spans several. `span-sm`, `span-md` and `span-lg` change the span from 640, 960 and 1280 px **grid** width: here the list and the details are stacked on narrow grids and side by side (8 + 4 of 12) from 960 px.

```html
<kern-grid columns="12">
  <kern-grid-item span="12" span-md="8">
    <kern-card heading="Devices">
      <kern-list flush>
        <kern-list-item heading="Bad Lüftung" description="Shelly Plus 1 · 192.168.1.42"></kern-list-item>
        <kern-list-item heading="Küche Licht" description="Shelly Dimmer 2 · 192.168.1.43"></kern-list-item>
      </kern-list>
    </kern-card>
  </kern-grid-item>
  <kern-grid-item span="12" span-md="4">
    <kern-card heading="Details">
      <kern-kv>
        <kern-kv-item label="Firmware">1.4.4</kern-kv-item>
        <kern-kv-item label="Uptime">12 d</kern-kv-item>
      </kern-kv>
    </kern-card>
  </kern-grid-item>
</kern-grid>
```


### 03-fit-gap

# Columns per width, fit and gap

`columns-sm`, `columns-md` and `columns-lg` change the column count with the grid width; children without `kern-grid-item` take one column each. In auto mode `fit` stretches few items over the whole width instead of leaving empty columns. `gap` is `sm` (12 px), `md` (16 px) or `lg` (24 px); `align="start"` keeps items at their own height.

```html
<kern-grid columns="1" columns-sm="2" columns-lg="4" gap="lg" align="start">
  <kern-card heading="Network">DHCP, 192.168.1.0/24</kern-card>
  <kern-card heading="Cloud">Off</kern-card>
  <kern-card heading="Updates">Stable, automatic at night</kern-card>
  <kern-card heading="Backup">Daily, 14 kept</kern-card>
</kern-grid>
<kern-grid min="200px" fit style="margin-top:16px">
  <kern-card heading="Fit">Two items fill the width.</kern-card>
  <kern-card heading="Fit">With auto-fill they would keep empty columns.</kern-card>
</kern-grid>
```



## Properties

| Property    | Attribute    | Description                                                                          | Type                   | Default     |
| ----------- | ------------ | ------------------------------------------------------------------------------------ | ---------------------- | ----------- |
| `align`     | `align`      | `stretch` makes items in a row equally high (cards); `start` keeps their own height. | `"start" \| "stretch"` | `'stretch'` |
| `columns`   | `columns`    | Fixed number of columns; switches from auto mode to columns.                         | `number \| undefined`  | `undefined` |
| `columnsLg` | `columns-lg` | Columns from 1280 px grid width.                                                     | `number \| undefined`  | `undefined` |
| `columnsMd` | `columns-md` | Columns from 960 px grid width.                                                      | `number \| undefined`  | `undefined` |
| `columnsSm` | `columns-sm` | Columns from 640 px grid width.                                                      | `number \| undefined`  | `undefined` |
| `fit`       | `fit`        | Auto mode: stretch few items over the whole width instead of keeping empty columns.  | `boolean`              | `false`     |
| `gap`       | `gap`        | Space between items: `sm` 12 px, `md` 16 px, `lg` 24 px.                             | `"lg" \| "md" \| "sm"` | `'md'`      |
| `min`       | `min`        | Smallest column width in auto mode (without `columns`), e.g. `240px` or `16rem`.     | `string`               | `'240px'`   |


## Slots

| Slot | Description                                                  |
| ---- | ------------------------------------------------------------ |
|      | The items: any elements, or `kern-grid-item` to span columns |


## Shadow Parts

| Part     | Description |
| -------- | ----------- |
| `"grid"` | The grid    |


----------------------------------------------


