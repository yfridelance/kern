# Live log

An MQTT log fed by a mock broker. `follow` keeps the log at its newest entry while it is scrolled to the end. Scroll up to read: the rows stay where they are, and a button counts the new entries below («12 new») and jumps back. «Pause» freezes the rows while messages keep arriving; the button then shows how many are waiting and resumes.

The app owns the data and the buffer: it appends new entries and trims its array to the same limit as `max-entries`, so memory stays bounded. The log never changes the array; it only shows the newest `max-entries` entries. «Burst» adds 2,000 entries at once to show the limit at work.

```html
<div style="display:grid;gap:8px">
  <kern-log follow max-entries="1000" max-height="320px" file-name="mqtt.log"></kern-log>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <kern-button size="sm" class="burst">Burst 2,000</kern-button>
    <kern-button size="sm" variant="ghost" class="clear">Clear</kern-button>
  </div>
</div>
```

```js
const log = root.querySelector('kern-log');
const MAX = 1000;
const devices = ['kitchen-light', 'bathroom-fan', 'shutter-south', 'garage-door', 'heating-pro3em'];
const messages = [
  ['debug', (d) => `PUBLISH shellies/${d}/online (retain) → true`],
  ['info', (d) => `shellies/${d}/relay/0 → on`],
  ['info', (d) => `shellies/${d}/relay/0 → off`],
  ['info', (d) => `shellies/${d}/temperature → ${(20 + Math.random() * 4).toFixed(1)}`],
  ['debug', (d) => `PINGREQ from ${d}`],
  ['warn', (d) => `Client ${d} reconnected after ${Math.ceil(Math.random() * 9)} s`],
  ['error', (d) => `Client ${d} disconnected: keep-alive timeout`],
];
let entries = [];
let next = 1;
function entry() {
  const device = devices[Math.floor(Math.random() * devices.length)];
  const r = Math.random();
  const [level, text] = messages[r < 0.03 ? 6 : r < 0.1 ? 5 : Math.floor(Math.random() * 5)];
  const id = next++;
  return {
    id, time: Date.now(), level, source: device, message: text(device),
    details: level === 'error' ? { clientId: device, lastPacket: new Date(Date.now() - 45_000).toISOString(), keepAlive: 30 } : undefined,
  };
}
// The app trims its buffer with the same limit as max-entries.
function add(list) {
  entries = [...entries, ...list].slice(-MAX);
  log.entries = entries;
}
add(Array.from({ length: 40 }, entry));
const timer = setInterval(() => {
  if (!log.isConnected) return clearInterval(timer);
  add(Array.from({ length: 1 + Math.floor(Math.random() * 3) }, entry));
}, 700);
root.querySelector('.burst').addEventListener('click', () => add(Array.from({ length: 2000 }, entry)));
root.querySelector('.clear').addEventListener('click', () => {
  entries = [];
  log.entries = entries;
});
```
