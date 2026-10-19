# kern-toast



<!-- Auto Generated Below -->


## Overview

Short, non-blocking feedback after an action („Snapshot gespeichert“). Usually created with `toast()`, which stacks
them at the bottom right. Closes itself after `duration` (paused while hovered or focused), with the × or the
optional action. `toast()` announces it through a polite live region; `danger` interrupts as an alert.

## Usage

### 01-toast-function

# Showing a toast

Usually you call `toast()`, imported from `'@yfridelance/kern'`. It stacks toasts at the bottom right (at most four), announces them through a polite live region and resolves with the reason the toast closed: `'timeout'`, `'close'` or `'action'`. A plain string works as the message.

```html
<div style="display:flex;flex-wrap:wrap;gap:12px">
  <kern-button class="ok">Save snapshot</kern-button>
  <kern-button class="info">Plain message</kern-button>
</div>
```

```js
const { toast } = await import('../kern/index.esm.js');
root.querySelector('.ok').addEventListener('click', () =>
  toast({ message: 'Snapshot of «Bad Lüftung» saved.', tone: 'ok' }));
root.querySelector('.info').addEventListener('click', () =>
  toast('Scan of 192.168.1.0/24 started.'));
```


### 02-action-and-errors

# Undo action and persistent errors

`actionLabel` adds a button; the promise then resolves with `'action'` when it is clicked. `duration` is in milliseconds (default 5000, paused while hovered or focused); `0` keeps the toast until the user closes it, which suits errors. `danger` interrupts as an alert.

```html
<div style="display:flex;flex-wrap:wrap;gap:12px">
  <kern-button class="undo">Remove 3 devices</kern-button>
  <kern-button class="err" variant="danger">Restart Küche Licht</kern-button>
</div>
<p class="out" style="font-size:13px;color:var(--text-muted)"></p>
```

```js
const { toast } = await import('../kern/index.esm.js');
root.querySelector('.undo').addEventListener('click', async () => {
  const reason = await toast({ message: '3 devices removed from «Garage».', actionLabel: 'Undo', duration: 8000 });
  root.querySelector('.out').textContent = `toast → ${reason}`;
});
root.querySelector('.err').addEventListener('click', () =>
  toast({ heading: 'Restart failed', message: 'Küche Licht does not respond (timeout).', tone: 'danger', duration: 0, closeLabel: 'Close' }));
```


### 03-element

# The element itself

kern-toast can also be placed directly, e.g. in a custom container. It closes itself after `duration`, with × (`close-label`) or the action, emitting `kernAction` and `kernClose` with the `reason`. Here `duration="0"` keeps them on the page.

```html
<div style="display:grid;gap:8px;max-width:380px">
  <kern-toast tone="ok" duration="0" close-label="Close">Snapshot of «Bad Lüftung» saved.</kern-toast>
  <kern-toast tone="warn" heading="Update available" action-label="Install" duration="0" close-label="Close">Firmware 1.4.4 for 3 devices.</kern-toast>
</div>
<p class="out" style="font-size:13px;color:var(--text-muted)"></p>
```

```js
for (const t of root.querySelectorAll('kern-toast')) {
  t.addEventListener('kernClose', (e) => (root.querySelector('.out').textContent = `kernClose → ${e.detail.reason}`));
}
```



## Properties

| Property      | Attribute      | Description                                                   | Type                                                | Default        |
| ------------- | -------------- | ------------------------------------------------------------- | --------------------------------------------------- | -------------- |
| `actionLabel` | `action-label` | Text of an optional action, e.g. „Rückgängig“.                | `string \| undefined`                               | `undefined`    |
| `closeLabel`  | `close-label`  |                                                               | `string`                                            | `'Schliessen'` |
| `duration`    | `duration`     | Milliseconds until it closes itself; 0 keeps it until closed. | `number`                                            | `5000`         |
| `heading`     | `heading`      |                                                               | `string \| undefined`                               | `undefined`    |
| `tone`        | `tone`         |                                                               | `"danger" \| "info" \| "neutral" \| "ok" \| "warn"` | `'neutral'`    |


## Events

| Event        | Description                                     | Type                                        |
| ------------ | ----------------------------------------------- | ------------------------------------------- |
| `kernAction` | The action was clicked (the toast then closes). | `CustomEvent<void>`                         |
| `kernClose`  | The toast closed; `reason` says why.            | `CustomEvent<{ reason: KernToastReason; }>` |


## Methods

### `close(reason?: KernToastReason) => Promise<void>`

Closes the toast.

#### Parameters

| Name     | Type                               | Description |
| -------- | ---------------------------------- | ----------- |
| `reason` | `"close" \| "timeout" \| "action"` |             |

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description  |
| ---- | ------------ |
|      | Message text |


## Shadow Parts

| Part       | Description       |
| ---------- | ----------------- |
| `"action"` | The action button |


----------------------------------------------


