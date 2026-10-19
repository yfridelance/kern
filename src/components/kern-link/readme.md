# kern-link



<!-- Auto Generated Below -->


## Overview

Text link for running text, table cells and cards. `external` opens a new tab (with `rel="noopener noreferrer"`)
and marks the link with ↗; `tone="muted"` for secondary links; `disabled` keeps the text but removes the link.
For actions use kern-button, also when it navigates.

## Usage

### 01-basic

# Links in text and tables

Use kern-link for navigation in running text, table cells and cards. `tone="muted"` is for secondary links; `disabled` keeps the text but removes the link.

```html
<p style="margin:0">
  12 snapshots, the latest from today 09:41. <kern-link href="#" tone="muted">Show all</kern-link><br>
  Open the device page of <kern-link href="#">Bad Lüftung</kern-link>, or
  <kern-link href="#" disabled>Garage Tor</kern-link> (reset, no page).
</p>
```


### 02-external-download

# External links and downloads

`external` opens the link in a new tab with `rel="noopener noreferrer"`, shows ↗ and reads `label-external` to screen readers. `download` saves the target instead of navigating, optionally under the given file name.

```html
<p style="margin:0;display:grid;gap:8px">
  <span>Web UI: <kern-link href="http://192.168.1.21" external label-external="opens in a new tab">192.168.1.21</kern-link></span>
  <span>Backup: <kern-link href="data:application/json,%7B%22name%22%3A%22Bad%20L%C3%BCftung%22%7D" download="bad-lueftung.json">bad-lueftung.json</kern-link></span>
</p>
```



## Properties

| Property        | Attribute        | Description                                                            | Type                             | Default                 |
| --------------- | ---------------- | ---------------------------------------------------------------------- | -------------------------------- | ----------------------- |
| `disabled`      | `disabled`       | Shown as text, not a link.                                             | `boolean`                        | `false`                 |
| `download`      | `download`       | Download instead of navigate (optionally with this file name).         | `boolean \| string \| undefined` | `undefined`             |
| `external`      | `external`       | Opens in a new tab and shows ↗.                                        | `boolean`                        | `false`                 |
| `href`          | `href`           |                                                                        | `string \| undefined`            | `undefined`             |
| `labelExternal` | `label-external` | Read after the text of `external` links.                               | `string`                         | `'öffnet in neuem Tab'` |
| `rel`           | `rel`            | Defaults to `noopener noreferrer` for `external` or `target="_blank"`. | `string \| undefined`            | `undefined`             |
| `target`        | `target`         |                                                                        | `string \| undefined`            | `undefined`             |
| `tone`          | `tone`           | `muted` for secondary links.                                           | `"accent" \| "muted"`            | `'accent'`              |


## Slots

| Slot | Description |
| ---- | ----------- |
|      | Link text   |


## Shadow Parts

| Part     | Description     |
| -------- | --------------- |
| `"link"` | The native link |


----------------------------------------------


