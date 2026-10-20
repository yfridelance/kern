# kern-code



<!-- Auto Generated Below -->


## Overview

Code and commands: a block with copy button, optional heading (file name), line numbers, wrapping and a maximum
height, highlighted for shell, yaml, json, js/ts, ini and html; or `inline` in running text. The code comes from `code`
or the text content; common indentation is removed, so it can be written indented in HTML.

## Usage

### 01-command

# Commands and config files

A code block with copy button, highlighted for `shell`, `yaml`, `json`, `js`/`ts` and `ini`. The code is the text content; common indentation is removed, so it can be indented with the HTML. `heading` shows a title such as a file name.

```html
<div style="display:grid;gap:16px">
  <kern-code language="shell" heading="Reboot a device">
    # Reboot via the RPC API
    curl -X POST "http://${IP:-192.168.1.21}/rpc/Shelly.Reboot" \
      -d '{"delay_ms": 500}'
  </kern-code>
  <kern-code language="json" heading="Shelly.GetStatus (excerpt)">
    {
      "wifi": { "sta_ip": "192.168.1.21", "rssi": -63 },
      "sys": { "uptime": 356420, "ram_free": 98764 },
      "cloud": { "connected": false }
    }
  </kern-code>
</div>
```


### 02-line-numbers

# Line numbers and height

`line-numbers` numbers the lines and `max-height` scrolls longer code. `wrap` wraps long lines instead of scrolling sideways.

```html
<div style="display:grid;gap:16px">
  <kern-code language="yaml" heading="configuration.yaml" line-numbers max-height="160px">
    mqtt:
      broker: "192.168.1.5"
      port: 1883
      discovery: true   # create devices automatically
    shelly:
      - host: 192.168.1.21
        name: Bathroom fan
      - host: 192.168.1.34
        name: Kitchen light
  </kern-code>
  <kern-code language="ini" heading="shelly-poller.service" line-numbers>
    [Unit]
    Description=Poll Shelly devices every 30 s
    After=network-online.target

    [Service]
    ExecStart=/usr/local/bin/shelly-poller --interval 30
    Restart=on-failure
  </kern-code>
  <kern-code language="ts" heading="poll.ts" wrap>
    const res = await fetch(`http://${ip}/rpc/Switch.GetStatus?id=0`, { signal: AbortSignal.timeout(3000) });
    const { apower, output } = await res.json(); // watts, on/off
  </kern-code>
</div>
```


### 03-inline

# Inline

`inline` puts code into running text, without the copy button; `language` still highlights it.

```html
<p>
  The config lives in <kern-code inline>/config/configuration.yaml</kern-code>;
  apply it with <kern-code inline language="shell">ha core restart</kern-code>.
</p>
```



## Properties

| Property      | Attribute      | Description                                    | Type                                                                       | Default     |
| ------------- | -------------- | ---------------------------------------------- | -------------------------------------------------------------------------- | ----------- |
| `code`        | `code`         | The code; defaults to the text content.        | `string \| undefined`                                                      | `undefined` |
| `heading`     | `heading`      | Title above the block, e.g. a file name.       | `string \| undefined`                                                      | `undefined` |
| `inline`      | `inline`       | In running text, without copy button.          | `boolean`                                                                  | `false`     |
| `labelCopied` | `label-copied` |                                                | `string \| undefined`                                                      | `undefined` |
| `labelCopy`   | `label-copy`   |                                                | `string \| undefined`                                                      | `undefined` |
| `language`    | `language`     |                                                | `"html" \| "ini" \| "js" \| "json" \| "shell" \| "text" \| "ts" \| "yaml"` | `'text'`    |
| `lineNumbers` | `line-numbers` |                                                | `boolean`                                                                  | `false`     |
| `maxHeight`   | `max-height`   | Scroll beyond this height, e.g. `240px`.       | `string \| undefined`                                                      | `undefined` |
| `noCopy`      | `no-copy`      | Hide the copy button.                          | `boolean`                                                                  | `false`     |
| `wrap`        | `wrap`         | Wrap long lines instead of scrolling sideways. | `boolean`                                                                  | `false`     |


## Events

| Event      | Description              | Type                              |
| ---------- | ------------------------ | --------------------------------- |
| `kernCopy` | After a successful copy. | `CustomEvent<{ value: string; }>` |


## Slots

| Slot | Description                          |
| ---- | ------------------------------------ |
|      | The code as text (instead of `code`) |


## Shadow Parts

| Part     | Description                              |
| -------- | ---------------------------------------- |
| `"code"` | The `<pre>` (block) or `<code>` (inline) |
| `"copy"` | The copy button                          |


----------------------------------------------


