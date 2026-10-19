# kern-spinner



<!-- Auto Generated Below -->


## Overview

Small busy indicator in the current text colour, for waits under a few seconds.

## Usage

### 01-basic

# Short waits

For waits under a few seconds. The spinner takes the current text colour; `size` sets the diameter in px. Without `label` it is decorative — give it one when nothing else tells screen readers that something is loading.

```html
<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center">
  <kern-spinner></kern-spinner>
  <kern-spinner size="20" label="Loading devices"></kern-spinner>
  <span style="display:flex;gap:8px;align-items:center;color:var(--text-muted)"><kern-spinner></kern-spinner>Querying 192.168.1.21 …</span>
</div>
```



## Properties

| Property | Attribute | Description                                            | Type                  | Default     |
| -------- | --------- | ------------------------------------------------------ | --------------------- | ----------- |
| `label`  | `label`   | Accessible text; without it the spinner is decorative. | `string \| undefined` | `undefined` |
| `size`   | `size`    | Diameter in px.                                        | `number`              | `14`        |


----------------------------------------------


