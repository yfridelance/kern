# Search and filters

A finished network scan. The search looks in message, source and details and marks the matches; levels and sources combine with it (several levels or sources are alternatives). The toolbar shows the number of matches with «Reset filters», and when nothing matches the log says so. `query`, `levels` and `sources` can be set from the app, e.g. to open the log with only warnings and errors; `kernFilter` reports the user's changes.

«Copy» copies the entries shown, after the filters; «Download» saves them as a text file (`kernDownload` is cancelable, to export them yourself). A single entry is copied with the button at the end of its row, or with Ctrl/Cmd+C on the focused row.

```html
<div style="display:grid;gap:8px">
  <kern-log max-height="280px" file-name="scan-192.168.1.0-24.log"></kern-log>
  <p class="state" style="margin:0;color:var(--text-muted);font-size:13px">kernFilter: –</p>
</div>
```

```js
const log = root.querySelector('kern-log');
const start = Date.parse('2026-10-20T08:00:00Z');
const hosts = [
  ['192.168.1.1', 'Router', 'info', 'Open ports: 53, 80, 443'],
  ['192.168.1.21', 'Kitchen light', 'info', 'Shelly 1 Mini Gen3, firmware 1.4.4'],
  ['192.168.1.22', 'Bathroom fan', 'warn', 'Shelly Plus 1PM, firmware 1.3.3: update available'],
  ['192.168.1.23', 'Shutter south', 'info', 'Shelly Plus 2PM, firmware 1.4.4'],
  ['192.168.1.30', 'NAS', 'warn', 'SMB1 enabled'],
  ['192.168.1.41', 'Garage door', 'error', 'No response to HTTP after 3 attempts'],
  ['192.168.1.42', 'Heating', 'info', 'Shelly Pro 3EM, firmware 1.4.4'],
  ['192.168.1.77', 'Unknown', 'warn', 'Unknown device, MAC A8:03:2A:7F:10:C4'],
];
const entries = [{ id: 0, time: start, level: 'info', source: 'scanner', message: 'Scan of 192.168.1.0/24 started (254 addresses)' }];
hosts.forEach(([ip, name, level, text], i) => {
  const t = start + (i + 1) * 1700;
  entries.push({ id: `${ip}-ping`, time: t, level: 'debug', source: ip, message: `ICMP echo reply from ${ip} in ${2 + i} ms` });
  entries.push({
    id: ip, time: t + 400, level, source: ip, message: `${name}: ${text}`,
    details: level === 'error' ? 'GET http://' + ip + '/shelly\n  attempt 1: timeout after 2000 ms\n  attempt 2: timeout after 2000 ms\n  attempt 3: connection refused' : undefined,
  });
});
entries.push({ id: 'done', time: start + 16_000, level: 'info', source: 'scanner', message: 'Scan finished: 8 hosts, 3 warnings, 1 error' });
log.entries = entries;
log.levels = ['info', 'warn', 'error'];
const state = root.querySelector('.state');
log.addEventListener('kernFilter', (e) => (state.textContent = `kernFilter: ${JSON.stringify(e.detail)}`));
```
