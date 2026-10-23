# Details, wrapping and a bare log

In a job drawer or a card, `no-filters` leaves only pause, copy and download, and `wrap` wraps long messages instead of scrolling sideways. Entries with `details` get a toggle (or Enter on the focused row) that shows them below the message: strings as given, objects as JSON. Everything is shown as text, so HTML in a message stays visible as markup.

Narrow logs move the message below time, level and source. Texts follow the Kern language (`setKernLocale()`, `<html lang>`); label properties override single texts, here in German.

```html
<kern-card heading="Firmware update · Bathroom fan" style="max-width:420px">
  <kern-log no-filters wrap max-height="240px" label-pause="Anhalten" label-resume="Fortsetzen" label-copy="Kopieren" label-download="Herunterladen"></kern-log>
</kern-card>
```

```js
const log = root.querySelector('kern-log');
const t = Date.parse('2026-10-20T08:00:00Z');
log.entries = [
  { id: 1, time: t, level: 'info', source: 'updater', message: 'Checking 192.168.1.22 (Bathroom fan): firmware 1.3.3 → 1.4.4' },
  { id: 2, time: t + 1200, level: 'info', source: 'updater', message: 'Downloading https://updates.example.net/shelly/plus1pm/1.4.4/firmware.zip (1.6 MB)' },
  { id: 3, time: t + 5200, level: 'warn', source: 'updater', message: 'Signature check took 4.1 s (expected < 2 s)' },
  { id: 4, time: t + 6400, level: 'info', source: 'device', message: '<b>Rebooting</b> – markup in messages is shown as text' },
  { id: 5, time: t + 21_000, level: 'error', source: 'device', message: 'Device did not come back within 15 s', details: { ip: '192.168.1.22', attempts: 3, lastError: 'ECONNREFUSED' } },
  { id: 6, time: t + 34_000, level: 'info', source: 'device', message: 'Device back online, firmware 1.4.4' },
];
```
