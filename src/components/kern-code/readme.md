# kern-code



<!-- Auto Generated Below -->


## Overview

Code and commands: a block with copy button, optional heading (file name), line numbers, wrapping and a maximum
height, highlighted for shell, PowerShell, yaml, json, js/ts, ini, html, Ruby and Go; or `inline` in running text. The code comes from `code`
or the text content; common indentation is removed, so it can be written indented in HTML.

With `follow` and `max-height` it suits live logs: appended lines scroll into view while the block is scrolled to the
end; scroll up and the position stays, with a button to jump back to the latest line.

## Usage

### 01-command

# Commands and config files

A code block with copy button, highlighted for `shell`, `powershell`, `yaml`, `json`, `js`/`ts`, `ini`, `html`, `ruby` and `go`. The code is the text content; common indentation is removed, so it can be indented with the HTML. `heading` shows a title such as a file name.

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


### 04-follow

# Live log

`follow` keeps a growing log at its latest line: set `code` with the new lines, and while the block is scrolled to the end it scrolls along. Scroll up to read, and the position stays; «Jump to latest» brings you back. Use it with `max-height`, so the log scrolls instead of the page. `scrollToEnd()` jumps to the end from script.

```html
<div style="display:grid;gap:8px;max-width:560px">
  <kern-code heading="shelly-update.log" max-height="160px" follow wrap></kern-code>
  <div><kern-button size="sm" class="again">Run again</kern-button></div>
</div>
```

```js
const log = root.querySelector('kern-code');
const steps = [
  'Checking 192.168.1.21 (Bathroom fan)', 'Firmware 1.3.2 → 1.4.4', 'Downloading 1.4.4 (1.6 MB)',
  ...Array.from({ length: 10 }, (_, i) => `Downloading … ${(i + 1) * 10} %`),
  'Verifying signature', 'Writing flash', 'Rebooting', 'Waiting for device', 'Device back online, firmware 1.4.4',
];
const time = new Intl.DateTimeFormat('en-GB', { timeStyle: 'medium' });
let timer;
function run() {
  clearInterval(timer);
  const lines = [];
  log.code = '';
  timer = setInterval(() => {
    lines.push(`${time.format(Date.now())}  ${steps[lines.length]}`);
    log.code = lines.join('\n');
    if (lines.length === steps.length) clearInterval(timer);
  }, 600);
}
root.querySelector('.again').addEventListener('click', run);
run();
```


### 05-languages

# PowerShell, Ruby and Go

`language="powershell"` (or `ps1`, `pwsh`) highlights cmdlets such as `Get-ChildItem`, `$variables`, operators like `-eq` and here-strings. `ruby` (`rb`) knows symbols, `@instance` variables and heredocs, `go` (`golang`) raw strings, runes and the predeclared types and functions.

```html
<div style="display:grid;gap:16px">
  <kern-code language="powershell" heading="Restart-Shelly.ps1" line-numbers>
    <# Turn a Shelly relay off and on again, e.g. to restart a frozen access point #>
    param([string]$Ip = $env:SHELLY_IP, [int]$Delay = 5)

    $status = Invoke-RestMethod -Uri "http://$Ip/rpc/Switch.GetStatus?id=0" -TimeoutSec 3
    if ($status.output -eq $true) {
        $body = @"
    {"id": 0, "on": false, "toggle_after": $Delay}
    "@
        Invoke-RestMethod -Method Post -Uri "http://$Ip/rpc/Switch.Set" -Body $body -ContentType 'application/json'
        Write-Host "Relay off, back on in $Delay s" -ForegroundColor Yellow
    }
  </kern-code>
  <kern-code language="ruby" heading="power_report.rb">
    require 'net/http'
    require 'json'

    DEVICES = { kitchen: '192.168.1.34', bathroom_fan: '192.168.1.21' }.freeze

    DEVICES.each do |name, ip|
      res = Net::HTTP.get(URI("http://#{ip}/rpc/Switch.GetStatus?id=0"))
      watts = JSON.parse(res, symbolize_names: true)[:apower]
      puts format('%-14s %6.1f W', name, watts)
    rescue Errno::EHOSTUNREACH, Net::OpenTimeout
      warn "#{name}: offline"
    end
  </kern-code>
  <kern-code language="go" heading="shelly.go">
    // Status reads the relay state of a Shelly Gen2 device.
    func Status(ctx context.Context, ip string) (bool, error) {
    	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
    	defer cancel()
    	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "http://"+ip+"/rpc/Switch.GetStatus?id=0", nil)
    	if err != nil {
    		return false, err
    	}
    	res, err := http.DefaultClient.Do(req)
    	if err != nil {
    		return false, fmt.Errorf("shelly %s: %w", ip, err)
    	}
    	defer res.Body.Close()
    	var s struct {
    		Output bool    `json:"output"`
    		Power  float64 `json:"apower"`
    	}
    	if err := json.NewDecoder(res.Body).Decode(&s); err != nil {
    		return false, err
    	}
    	return s.Output, nil
    }
  </kern-code>
</div>
```



## Properties

| Property      | Attribute      | Description                                                                                                                                                                                                        | Type                                                                                                                                                | Default     |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `code`        | `code`         | The code; defaults to the text content.                                                                                                                                                                            | `string \| undefined`                                                                                                                               | `undefined` |
| `follow`      | `follow`       | Follow new lines, for live logs with `max-height`: when the code changes while the block is scrolled to the end, it scrolls to the new end. Scrolled up, the position stays and a button jumps to the latest line. | `boolean`                                                                                                                                           | `false`     |
| `heading`     | `heading`      | Title above the block, e.g. a file name.                                                                                                                                                                           | `string \| undefined`                                                                                                                               | `undefined` |
| `inline`      | `inline`       | In running text, without copy button.                                                                                                                                                                              | `boolean`                                                                                                                                           | `false`     |
| `labelCopied` | `label-copied` |                                                                                                                                                                                                                    | `string \| undefined`                                                                                                                               | `undefined` |
| `labelCopy`   | `label-copy`   |                                                                                                                                                                                                                    | `string \| undefined`                                                                                                                               | `undefined` |
| `labelLatest` | `label-latest` |                                                                                                                                                                                                                    | `string \| undefined`                                                                                                                               | `undefined` |
| `language`    | `language`     | Highlighting: `shell`, `powershell` (`ps1`, `pwsh`), `yaml`, `json`, `js`, `ts`, `ini`, `html`, `ruby` (`rb`), `go` (`golang`) or `text`.                                                                          | `"go" \| "golang" \| "html" \| "ini" \| "js" \| "json" \| "powershell" \| "ps1" \| "pwsh" \| "rb" \| "ruby" \| "shell" \| "text" \| "ts" \| "yaml"` | `'text'`    |
| `lineNumbers` | `line-numbers` |                                                                                                                                                                                                                    | `boolean`                                                                                                                                           | `false`     |
| `maxHeight`   | `max-height`   | Scroll beyond this height, e.g. `240px`.                                                                                                                                                                           | `string \| undefined`                                                                                                                               | `undefined` |
| `noCopy`      | `no-copy`      | Hide the copy button.                                                                                                                                                                                              | `boolean`                                                                                                                                           | `false`     |
| `wrap`        | `wrap`         | Wrap long lines instead of scrolling sideways.                                                                                                                                                                     | `boolean`                                                                                                                                           | `false`     |


## Events

| Event      | Description              | Type                              |
| ---------- | ------------------------ | --------------------------------- |
| `kernCopy` | After a successful copy. | `CustomEvent<{ value: string; }>` |


## Methods

### `scrollToEnd() => Promise<void>`

Scroll the block to its last line.

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description                          |
| ---- | ------------------------------------ |
|      | The code as text (instead of `code`) |


## Shadow Parts

| Part       | Description                                 |
| ---------- | ------------------------------------------- |
| `"code"`   | The `<pre>` (block) or `<code>` (inline)    |
| `"copy"`   | The copy button                             |
| `"latest"` | The «Jump to latest» button (with `follow`) |


----------------------------------------------


