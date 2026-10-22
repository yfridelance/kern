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
