# kern-card



<!-- Auto Generated Below -->


## Overview

Surface for one block of related content. Border, no shadow; no cards inside cards.

## Usage

### 01-basic

# Card with header and footer

`heading` titles the card; `meta` sits next to the heading and `actions` holds small buttons on the right. Form buttons go into the `footer` slot.

```html
<kern-card heading="Device" style="max-width:420px">
  <kern-badge slot="meta">Gen2</kern-badge>
  <kern-button slot="actions" size="sm" variant="ghost">Snapshot</kern-button>
  <kern-kv>
    <kern-kv-item label="Model">Shelly Plus 1PM</kern-kv-item>
    <kern-kv-item label="IP"><kern-copy>192.168.1.21</kern-copy></kern-kv-item>
    <kern-kv-item label="Firmware" mono>1.4.4</kern-kv-item>
  </kern-kv>
  <kern-button slot="footer" variant="ghost">Cancel</kern-button>
  <kern-button slot="footer" variant="primary">Save</kern-button>
</kern-card>
```


### 02-flush

# Flush body and heading level

`flush` removes the body padding so lists and tables reach the edge. `heading-level` sets the heading element (2–4) to fit the document outline.

```html
<kern-card heading="Events" heading-level="3" flush style="max-width:420px">
  <kern-list flush size="sm" label="Events">
    <kern-list-item heading="Bad Lüftung" description="Snapshot saved">
      <kern-status slot="start" tone="ok"></kern-status>
    </kern-list-item>
    <kern-list-item heading="Rollladen Süd" description="Not reachable since yesterday">
      <kern-status slot="start" tone="warn"></kern-status>
    </kern-list-item>
  </kern-list>
</kern-card>
```


### 03-loading

# Loading state

While data loads, fill the card with kern-skeleton placeholders and mark it with `aria-busy="true"`.

```html
<kern-card heading="Loading …" aria-busy="true" style="max-width:320px">
  <div style="display:flex;gap:12px;align-items:center">
    <kern-skeleton variant="circle" size="28px"></kern-skeleton>
    <kern-skeleton lines="2"></kern-skeleton>
  </div>
  <kern-skeleton variant="block" height="40px" style="margin-top:12px"></kern-skeleton>
</kern-card>
```



## Properties

| Property       | Attribute       | Description                                          | Type                  | Default     |
| -------------- | --------------- | ---------------------------------------------------- | --------------------- | ----------- |
| `flush`        | `flush`         | Body without padding (tables, lists up to the edge). | `boolean`             | `false`     |
| `heading`      | `heading`       |                                                      | `string \| undefined` | `undefined` |
| `headingLevel` | `heading-level` | Heading level for the document outline.              | `2 \| 3 \| 4`         | `2`         |


## Slots

| Slot        | Description                              |
| ----------- | ---------------------------------------- |
|             | Body                                     |
| `"actions"` | Small buttons on the right of the header |
| `"footer"`  | Form actions, right-aligned              |
| `"meta"`    | Next to the heading (badge, subtitle)    |


## Shadow Parts

| Part       | Description |
| ---------- | ----------- |
| `"body"`   | Body        |
| `"header"` | Header row  |


----------------------------------------------


