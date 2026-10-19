# kern-alert



<!-- Auto Generated Below -->


## Overview

Message in the page flow: information, success, warning or error. One or two sentences;
`danger` is announced as an alert, the others as status.

## Usage

### 01-tones

# Messages in the page

One or two sentences in the page flow. `heading` adds a bold first line. `danger` is announced as an alert, the other tones politely as status.

```html
<div style="display:grid;gap:8px;max-width:640px">
  <kern-alert tone="info" heading="Container network">Inside a container you only see the internal network. Enter the IP range of your Wi-Fi.</kern-alert>
  <kern-alert tone="ok">Snapshot saved.</kern-alert>
  <kern-alert tone="warn" heading="Device starts in AP mode">After the reset it has left the network.</kern-alert>
  <kern-alert tone="danger">Snapshot failed: timeout.</kern-alert>
  <kern-alert>3 devices are not assigned to a room.</kern-alert>
</div>
```



## Properties

| Property  | Attribute | Description               | Type                                                | Default     |
| --------- | --------- | ------------------------- | --------------------------------------------------- | ----------- |
| `heading` | `heading` | Optional bold first line. | `string \| undefined`                               | `undefined` |
| `tone`    | `tone`    |                           | `"danger" \| "info" \| "neutral" \| "ok" \| "warn"` | `'neutral'` |


## Slots

| Slot | Description  |
| ---- | ------------ |
|      | Message text |


## Shadow Parts

| Part     | Description    |
| -------- | -------------- |
| `"icon"` | The tone glyph |


----------------------------------------------


