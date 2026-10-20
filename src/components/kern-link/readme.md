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
  <span>Web UI: <kern-link href="http://192.168.1.21" external>192.168.1.21</kern-link></span>
  <span>Backup: <kern-link href="data:application/json,%7B%22name%22%3A%22Bad%20L%C3%BCftung%22%7D" download="bad-lueftung.json">bad-lueftung.json</kern-link></span>
</p>
```


### 03-router

# With a SPA router

A plain left click on kern-link emits the cancelable `kernNavigate` with `{ href, event }`; `preventDefault()` stops the page load so the app can route itself. Ctrl/Cmd click, middle click, `external`, `target="_blank"` and `download` emit nothing, so "open in new tab" keeps working.

React 19 binds `onkernNavigate` directly (older versions need `addEventListener` through a ref); Vue binds `@kernNavigate` in single-file components.

```html
<p style="margin:0">
  Open <kern-link href="#/devices/bad-lueftung">Bad Lüftung</kern-link> or
  <kern-link href="#/devices" tone="muted">all devices</kern-link>.
</p>
<p class="out" style="margin:12px 0 0;font-size:13px;color:var(--text-muted)">Click a link.</p>
```

```js
root.addEventListener('kernNavigate', (e) => {
  e.preventDefault();
  root.querySelector('.out').textContent = 'router.navigateByUrl(' + JSON.stringify(e.detail.href.slice(1)) + ')';
});
```

```ts Angular
<kern-link href="/devices/7" (kernNavigate)="$event.preventDefault(); router.navigateByUrl($event.detail.href)">Bad Lüftung</kern-link>
```

```js React
<kern-link href="/devices/7" onkernNavigate={(e) => { e.preventDefault(); navigate(e.detail.href); }}>Bad Lüftung</kern-link>
```

```html Vue
<kern-link href="/devices/7" @kernNavigate="(e) => { e.preventDefault(); router.push(e.detail.href); }">Bad Lüftung</kern-link>
```



## Properties

| Property        | Attribute        | Description                                                            | Type                             | Default     |
| --------------- | ---------------- | ---------------------------------------------------------------------- | -------------------------------- | ----------- |
| `disabled`      | `disabled`       | Shown as text, not a link.                                             | `boolean`                        | `false`     |
| `download`      | `download`       | Download instead of navigate (optionally with this file name).         | `boolean \| string \| undefined` | `undefined` |
| `external`      | `external`       | Opens in a new tab and shows ↗.                                        | `boolean`                        | `false`     |
| `href`          | `href`           |                                                                        | `string \| undefined`            | `undefined` |
| `labelExternal` | `label-external` | Read after the text of `external` links.                               | `string \| undefined`            | `undefined` |
| `rel`           | `rel`            | Defaults to `noopener noreferrer` for `external` or `target="_blank"`. | `string \| undefined`            | `undefined` |
| `target`        | `target`         |                                                                        | `string \| undefined`            | `undefined` |
| `tone`          | `tone`           | `muted` for secondary links.                                           | `"accent" \| "muted"`            | `'accent'`  |


## Events

| Event          | Description                                                                                                                                                                 | Type                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `kernNavigate` | Plain left click (no modifier keys, `target`, `download`, `external`) before the browser navigates. `preventDefault()` stops the navigation, so a SPA router can take over. | `CustomEvent<KernNavigateDetail>` |


## Slots

| Slot | Description |
| ---- | ----------- |
|      | Link text   |


## Shadow Parts

| Part     | Description     |
| -------- | --------------- |
| `"link"` | The native link |


----------------------------------------------


