# Jobs and activity

Scans, firmware updates and deployments take longer than a spinner can explain. People want to see what runs, on which target, for how long, what failed and what they can still do about it. This page builds such a job view from `kern-card`, `kern-status`, `kern-progress`, `kern-time`, `kern-table` or `kern-list` and `kern-code`.

Kern has no job engine. Your app starts the job, receives its progress (polling, WebSocket, server-sent events), decides whether it can be cancelled or retried and holds every text. Kern only draws the state it is given. The examples use `simulateTargets()` from `docs/assets/mock.js` as a pretend backend.

- **States per target:** waiting, running with progress, done, failed, skipped, cancelled. `kern-status` shows each one with a shape and a word, never with colour alone.
- **Job state:** one `kern-status` for the whole job. After the end, partial failures stay visible: «Finished with errors» plus the counts.
- **Actions:** Cancel and Retry only appear when the app's API offers them. A requested action stays visible until the backend confirms it («Cancelling …», `busy`).
- **Texts:** every word on screen comes from the app (here in English, from one `t` object), so it can be translated.

## A job over many targets

A firmware update on 12 devices. The card header holds the title, the job state and the actions; below it the start time, the runtime and the overall progress. Each device is a table row with its progress, state and duration. Expand a row for its details, the error and the log. Two devices fail on the first attempt, offline devices are skipped; **Retry failed** runs only the failed and cancelled ones again.

Try it with the keyboard: expand a row or focus a button, then start the job. Focus, open rows and the scroll position stay where they are while the rows update, see [Live updates without losing focus](#live-updates-without-losing-focus-title).

```html
<style>
  .job-meta { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-4); margin: 0 0 var(--space-3); font-size: 13px; color: var(--text-muted); }
  .job-meta kern-time, .job-meta strong { color: var(--text); font-weight: 500; }
  .job-progress { margin-bottom: var(--space-4); }
  .job-table td { padding-block: var(--space-2); }
  .job-table td kern-progress { min-width: 120px; }
  .job-details { display: grid; gap: var(--space-3); max-width: 640px; }
  .job-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
<kern-card class="job" heading="Firmware update on 12 devices" heading-level="4">
  <kern-status slot="meta" class="job-state">Not started</kern-status>
  <kern-button slot="actions" size="sm" variant="primary" class="job-start">Start update</kern-button>
  <kern-button slot="actions" size="sm" class="job-cancel" hidden>Cancel</kern-button>
  <kern-button slot="actions" size="sm" class="job-retry" hidden>Retry failed</kern-button>
  <kern-button slot="actions" size="sm" variant="ghost" class="job-again" hidden>Start over</kern-button>
  <p class="job-meta" hidden>
    <span>Started <kern-time class="job-started" seconds></kern-time></span>
    <span>Runtime <kern-time class="job-runtime"></kern-time></span>
    <strong class="job-counts"></strong>
  </p>
  <kern-progress class="job-progress" label="Devices" value="0" max="12" value-text="0 / 12"></kern-progress>
  <p class="job-sr" role="status"></p>
  <kern-table class="job-table">
    <table>
      <thead>
        <tr><th><span class="job-sr">Details</span></th><th>Device</th><th>Status</th><th class="num">Duration</th></tr>
      </thead>
      <tbody></tbody>
    </table>
  </kern-table>
</kern-card>
```

```js
const { devices, simulateTargets } = await import('../assets/mock.js');

// Every text comes from the app.
const t = {
  target: { pending: 'Waiting', running: 'Updating', done: 'Updated', failed: 'Failed', skipped: 'Skipped', cancelled: 'Cancelled' },
  job: { idle: 'Not started', running: 'Running', cancelling: 'Cancelling …', done: 'Finished', errors: 'Finished with errors', failed: 'Failed', cancelled: 'Cancelled' },
  log: { start: 'Update to 1.4.4 started', 25: 'Firmware downloaded (1.8 MB)', 50: 'Firmware written', 75: 'Rebooting', 100: 'Running firmware 1.4.4', skipped: 'Skipped: device is offline', cancelled: 'Cancelled by user' },
  details: (name) => `Details for ${name}`,
  counts: (c) => [`${c.done} updated`, c.failed && `${c.failed} failed`, c.skipped && `${c.skipped} skipped`, c.cancelled && `${c.cancelled} cancelled`].filter(Boolean).join(' · '),
  cancel: 'Cancel',
};
// What the app's API offers for this job. Without an offer the button never shows.
const offers = { cancel: true, retry: true };

const TONE = { pending: 'neutral', running: 'busy', done: 'ok', failed: 'danger', skipped: 'neutral', cancelled: 'neutral' };
const JOB_TONE = { idle: 'neutral', running: 'busy', cancelling: 'busy', done: 'ok', errors: 'warn', failed: 'danger', cancelled: 'neutral' };
// Ten devices with an update pending and two that are offline.
const targets = [...devices.filter((d) => d.status === 'update').slice(0, 10), ...devices.filter((d) => d.status === 'offline').slice(0, 2)];
const failOnce = new Set([targets[3].id, targets[8].id]);

const card = root.querySelector('.job');
const $ = (selector) => card.querySelector(selector);
const ui = {
  state: $('.job-state'), meta: $('.job-meta'), started: $('.job-started'), runtime: $('.job-runtime'), counts: $('.job-counts'),
  progress: $('.job-progress'), live: $('[role="status"]'),
  start: $('.job-start'), cancel: $('.job-cancel'), retry: $('.job-retry'), again: $('.job-again'),
};
const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// Rows are created once and keyed by the device id (`data-key`). Live updates only change their contents.
const rows = new Map();
for (const d of targets) {
  const tr = document.createElement('tr');
  tr.dataset.key = d.id;
  tr.innerHTML = `<td><button kern-expand><kern-icon name="chevron-right"></kern-icon></button></td>
    <td><kern-progress value="0"></kern-progress></td><td><kern-status></kern-status></td><td class="num"><kern-time></kern-time></td>`;
  const details = document.createElement('tr');
  details.setAttribute('kern-details', '');
  details.innerHTML = `<td><div class="job-details">
    <kern-kv>
      <kern-kv-item label="IP" mono></kern-kv-item><kern-kv-item label="Firmware" mono></kern-kv-item>
      <kern-kv-item label="Started"><kern-time seconds></kern-time></kern-kv-item><kern-kv-item label="Ended"><kern-time seconds></kern-time></kern-kv-item>
    </kern-kv>
    <kern-alert tone="danger" heading="Update failed" hidden></kern-alert>
    <kern-code heading="Log" wrap></kern-code>
  </div></td>`;
  const [ip, firmware] = details.querySelectorAll('kern-kv-item');
  ip.textContent = d.ip;
  firmware.textContent = `${d.firmware} → 1.4.4`;
  tr.querySelector('[kern-expand]').setAttribute('aria-label', t.details(d.name));
  const progress = tr.querySelector('kern-progress');
  progress.label = d.name;
  const [started, ended] = details.querySelectorAll('kern-kv-item kern-time');
  rows.set(d.id, {
    device: d, progress, status: tr.querySelector('kern-status'), duration: tr.querySelector('td.num kern-time'),
    started, ended, alert: details.querySelector('kern-alert'), log: details.querySelector('kern-code'), lines: [], last: {}, attempts: 0,
  });
  $('tbody').append(tr, details);
}

const states = new Map(targets.map((d) => [d.id, { key: d.id, status: 'pending', progress: 0 }]));
const seconds = (s) => (s.startedAt ? Math.round(((s.endedAt ?? Date.now()) - s.startedAt) / 1000) : '');

// Paints one target: only what changed since the last paint, on the existing elements.
function paint(s) {
  const r = rows.get(s.key);
  const log = (text) => {
    r.lines.push(`${clock.format(Date.now())}  ${text}`);
    r.log.code = r.lines.join('\n');
  };
  if (s.status !== r.last.status) {
    r.status.tone = TONE[s.status];
    r.status.textContent = t.target[s.status];
    if (s.status === 'running') {
      r.attempts++;
      r.alert.hidden = true;
      log(t.log.start);
    }
    if (s.status === 'failed') {
      r.alert.textContent = s.error;
      r.alert.hidden = false;
      log(s.error);
    }
    if (s.status === 'skipped' || s.status === 'cancelled') log(t.log[s.status]);
  }
  if (s.progress !== r.last.progress) {
    r.progress.value = s.progress;
    r.progress.valueText = `${s.progress} %`;
    if (s.status === 'running' && t.log[s.progress]) log(t.log[s.progress]);
  }
  if (s.startedAt !== r.last.startedAt) r.started.value = s.startedAt ?? '';
  if (s.endedAt !== r.last.endedAt) r.ended.value = s.startedAt ? s.endedAt ?? '' : '';
  r.duration.duration = seconds(s);
  r.last = s;
}

let phase = 'idle';
let controller;
let startedAt;
let endedAt;
let timer;

const counts = () => {
  const c = { pending: 0, running: 0, done: 0, failed: 0, skipped: 0, cancelled: 0 };
  for (const s of states.values()) c[s.status]++;
  return c;
};
const jobKey = (c) => (phase !== 'ended' ? phase : c.cancelled ? 'cancelled' : c.failed ? (c.done ? 'errors' : 'failed') : 'done');

function header() {
  const c = counts();
  const finished = states.size - c.pending - c.running;
  Object.assign(ui.progress, { value: finished, max: states.size, valueText: `${finished} / ${states.size}` });
  ui.counts.textContent = t.counts(c);
  ui.runtime.duration = startedAt ? Math.round(((endedAt ?? Date.now()) - startedAt) / 1000) : '';
}

// Job state, announcement and the actions the app offers in this phase.
function setPhase(next) {
  phase = next;
  const c = counts();
  const key = jobKey(c);
  ui.state.tone = JOB_TONE[key];
  ui.state.textContent = t.job[key];
  // Announce phase changes only, not every step.
  ui.live.textContent = phase === 'ended' ? `${t.job[key]}: ${t.counts(c)}` : t.job[key];
  ui.meta.hidden = phase === 'idle';
  const focused = Object.values(ui).find((el) => el.tagName === 'KERN-BUTTON' && el.matches(':focus-within'));
  ui.start.hidden = phase !== 'idle';
  ui.cancel.hidden = !offers.cancel || (phase !== 'running' && phase !== 'cancelling');
  ui.cancel.busy = phase === 'cancelling';
  ui.cancel.textContent = phase === 'cancelling' ? t.job.cancelling : t.cancel;
  ui.retry.hidden = !offers.retry || phase !== 'ended' || !(c.failed + c.cancelled);
  ui.again.hidden = phase !== 'ended';
  // A focused button that disappears hands focus to the next visible action.
  if (focused?.hidden) [ui.retry, ui.again, ui.cancel, ui.start].find((b) => !b.hidden)?.focus();
  header();
}

async function run(keys) {
  controller = new AbortController();
  endedAt = undefined;
  startedAt ??= Date.now();
  ui.started.value = startedAt;
  setPhase('running');
  timer = setInterval(() => {
    for (const s of states.values()) if (s.status === 'running') rows.get(s.key).duration.duration = seconds(s);
    header();
  }, 1000);
  await simulateTargets(keys, {
    signal: controller.signal,
    stepMs: 600,
    skip: (key) => rows.get(key).device.status === 'offline',
    fail: (key) => failOnce.has(key) && rows.get(key).attempts === 1,
    onUpdate: (list) => {
      for (const s of list) {
        states.set(s.key, s);
        paint(s);
      }
      header();
    },
  });
  clearInterval(timer);
  endedAt = Date.now();
  setPhase('ended');
}

ui.start.addEventListener('click', () => run([...states.keys()]));
ui.cancel.addEventListener('click', async () => {
  if (phase !== 'running') return;
  // The request belongs to this run: if it ends meanwhile and a new one starts, the new one keeps running.
  const job = controller;
  setPhase('cancelling');
  // The app asks its backend to cancel; the button stays busy until the backend confirms.
  await new Promise((resolve) => setTimeout(resolve, 900));
  job.abort();
});
ui.retry.addEventListener('click', () => run([...states.values()].filter((s) => s.status === 'failed' || s.status === 'cancelled').map((s) => s.key)));
ui.again.addEventListener('click', () => {
  startedAt = undefined;
  for (const r of rows.values()) {
    Object.assign(r, { lines: [], attempts: 0 });
    r.log.code = '';
  }
  run([...states.keys()]);
});
for (const s of states.values()) paint(s);
setPhase('idle');
```

## Indeterminate progress: a network scan

A scan without a target list: the backend reports devices as it finds them, but nobody knows in advance how many addresses will answer. So the bar runs without `value`, and the count of found devices sits next to it. Found devices are appended to a `kern-list`; existing items are never rebuilt.

When the scan ends, the bar goes away and the state says how it ended. Here, too, Cancel only shows while the scan runs and stays busy until the backend confirms.

```html
<style>
  .scan-meta { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-4); margin: 0 0 var(--space-3); font-size: 13px; color: var(--text-muted); }
  .scan-meta kern-time { color: var(--text); font-weight: 500; }
  .scan-progress { margin-bottom: var(--space-4); }
  .scan-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
<kern-card class="scan" heading="Network scan 192.168.1.0/24" heading-level="4">
  <kern-status slot="meta" class="scan-state">Not started</kern-status>
  <kern-button slot="actions" size="sm" variant="primary" class="scan-start">Scan network</kern-button>
  <kern-button slot="actions" size="sm" class="scan-cancel" hidden>Cancel</kern-button>
  <p class="scan-meta" hidden>
    <span>Started <kern-time class="scan-started" seconds></kern-time></span>
    <span>Runtime <kern-time class="scan-runtime"></kern-time></span>
  </p>
  <kern-progress class="scan-progress" label="Looking for devices …" hidden></kern-progress>
  <p class="scan-sr" role="status"></p>
  <kern-list class="scan-found" label="Found devices" empty="No devices found yet"></kern-list>
</kern-card>
```

```js
const { devices, simulateTargets } = await import('../assets/mock.js');

const t = {
  idle: 'Not started', running: 'Scanning', cancelling: 'Cancelling …', done: 'Scan complete', cancelled: 'Scan cancelled',
  found: (n) => (n === 1 ? '1 device found' : `${n} devices found`),
  start: 'Scan network', again: 'Scan again', cancel: 'Cancel',
};
const TONE = { idle: 'neutral', running: 'busy', cancelling: 'busy', done: 'ok', cancelled: 'neutral' };

// Only the pretend backend knows the addresses; the UI just hears about devices that answer.
const hosts = Array.from({ length: 32 }, (_, i) => `192.168.1.${20 + i}`);
const answering = new Map(devices.filter((d) => d.status !== 'offline').map((d) => [d.ip, d]));

const card = root.querySelector('.scan');
const $ = (selector) => card.querySelector(selector);
const ui = {
  state: $('.scan-state'), meta: $('.scan-meta'), started: $('.scan-started'), runtime: $('.scan-runtime'),
  progress: $('.scan-progress'), live: $('[role="status"]'), list: $('.scan-found'), start: $('.scan-start'), cancel: $('.scan-cancel'),
};
let found = 0;
let startedAt;
let endedAt;
let controller;

const runtime = () => (ui.runtime.duration = Math.round(((endedAt ?? Date.now()) - startedAt) / 1000));

function setPhase(phase) {
  ui.state.tone = TONE[phase];
  ui.state.textContent = t[phase];
  ui.live.textContent = phase === 'done' || phase === 'cancelled' ? `${t[phase]}: ${t.found(found)}` : t[phase];
  ui.meta.hidden = phase === 'idle';
  ui.progress.hidden = phase !== 'running' && phase !== 'cancelling';
  const focused = ui.cancel.matches(':focus-within');
  ui.cancel.hidden = phase !== 'running' && phase !== 'cancelling';
  ui.cancel.busy = phase === 'cancelling';
  ui.cancel.textContent = phase === 'cancelling' ? t.cancelling : t.cancel;
  ui.start.hidden = !ui.cancel.hidden;
  ui.start.textContent = phase === 'idle' ? t.start : t.again;
  if (focused && ui.cancel.hidden) ui.start.focus();
}

function add(device) {
  const item = document.createElement('kern-list-item');
  Object.assign(item, { heading: device.name, description: device.model, meta: device.ip });
  ui.list.append(item);
  ui.progress.valueText = t.found(++found);
}

ui.start.addEventListener('click', async () => {
  ui.list.replaceChildren();
  found = 0;
  Object.assign(ui.progress, { valueText: t.found(0) });
  controller = new AbortController();
  startedAt = Date.now();
  endedAt = undefined;
  ui.started.value = startedAt;
  runtime();
  setPhase('running');
  const timer = setInterval(runtime, 1000);
  const seen = new Set();
  const final = await simulateTargets(hosts, {
    signal: controller.signal,
    parallel: 6,
    stepMs: 300,
    fail: (ip) => !answering.has(ip),
    onUpdate: (list) => {
      for (const s of list) {
        if (s.status === 'done' && !seen.has(s.key)) {
          seen.add(s.key);
          add(answering.get(s.key));
        }
      }
    },
  });
  clearInterval(timer);
  endedAt = Date.now();
  runtime();
  setPhase(final.some((s) => s.status === 'cancelled') ? 'cancelled' : 'done');
});
ui.cancel.addEventListener('click', async () => {
  if (ui.cancel.busy) return;
  const scan = controller; // only this scan, not one started after it ended
  setPhase('cancelling');
  await new Promise((resolve) => setTimeout(resolve, 700));
  scan.abort();
});
setPhase('idle');
```

## Steps without cancel: a deployment

A deployment runs its steps one after another, so a `kern-list` with one item per step fits better than a table. The deployment API of this app offers no cancel, so there is no Cancel button. Don't draw a disabled one either: it promises an action that never comes.

When a step fails, the following steps are skipped and say why. The state of the whole deployment is «Failed», and the failed step keeps its error after the end. While the deployment runs, the start button itself shows the pending action: it stays `busy`, so it can't be pressed twice. The log follows new lines while it is scrolled to the bottom; scroll up and it stays where you are. The second attempt succeeds.

```html
<style>
  .deploy-log { margin-top: var(--space-3); }
  .deploy-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
<kern-card class="deploy" heading="Deploy configuration to Haus Seeblick" heading-level="4">
  <kern-status slot="meta" class="deploy-state">Not started</kern-status>
  <kern-button slot="actions" size="sm" variant="primary" class="deploy-start">Deploy</kern-button>
  <p class="deploy-sr" role="status"></p>
  <kern-list class="deploy-steps" label="Steps" size="sm"></kern-list>
  <kern-code class="deploy-log" heading="Log" max-height="140px" wrap></kern-code>
</kern-card>
```

```js
const { simulateTargets } = await import('../assets/mock.js');

const t = {
  steps: { validate: 'Validate template', backup: 'Back up current settings', push: 'Push settings to 20 devices', restart: 'Restart devices', check: 'Health check' },
  step: { pending: 'Waiting', running: 'Running', done: 'Done', failed: 'Failed', skipped: 'Skipped', cancelled: 'Cancelled' },
  job: { idle: 'Not started', running: 'Deploying', done: 'Deployed', failed: 'Failed' },
  skippedBecause: (step) => `Not run because «${step}» failed`,
  error: '3 of 20 devices rejected the settings (HTTP 409)',
  deploy: 'Deploy', again: 'Deploy again',
};
const TONE = { pending: 'neutral', running: 'busy', done: 'ok', failed: 'danger', skipped: 'neutral', cancelled: 'neutral' };
const keys = Object.keys(t.steps);

const card = root.querySelector('.deploy');
const ui = { state: card.querySelector('.deploy-state'), live: card.querySelector('[role="status"]'), start: card.querySelector('.deploy-start'), list: card.querySelector('.deploy-steps'), log: card.querySelector('.deploy-log') };
const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// One item per step, created once.
const items = new Map(
  keys.map((key) => {
    const item = document.createElement('kern-list-item');
    item.heading = t.steps[key];
    item.innerHTML = '<kern-status slot="start"></kern-status><kern-time slot="meta"></kern-time>';
    ui.list.append(item);
    return [key, { item, status: item.querySelector('kern-status'), time: item.querySelector('kern-time'), last: {} }];
  }),
);

// Workaround until kern-code can follow new lines (#150): scroll its <pre> to the end if it was at the end.
async function appendLog(text) {
  const pre = ui.log.shadowRoot?.querySelector('pre');
  const atEnd = !pre || pre.scrollTop + pre.clientHeight >= pre.scrollHeight - 4;
  ui.log.code = `${ui.log.code ? `${ui.log.code}\n` : ''}${clock.format(Date.now())}  ${text}`;
  await ui.log.componentOnReady();
  const after = ui.log.shadowRoot?.querySelector('pre');
  if (atEnd && after) requestAnimationFrame(() => (after.scrollTop = after.scrollHeight));
}

let failedStep;
let attempt = 0;

function paint(s) {
  const r = items.get(s.key);
  if (s.status !== r.last.status) {
    r.status.tone = TONE[s.status];
    r.status.textContent = t.step[s.status];
    r.item.description = s.status === 'failed' ? s.error : s.status === 'skipped' ? t.skippedBecause(t.steps[failedStep]) : '';
    if (s.status === 'running') appendLog(`${t.steps[s.key]} …`);
    if (s.status === 'done') appendLog(`${t.steps[s.key]}: ${t.step.done}`);
    if (s.status === 'failed') appendLog(`${t.steps[s.key]}: ${s.error}`);
  }
  r.time.duration = s.startedAt ? Math.round(((s.endedAt ?? Date.now()) - s.startedAt) / 1000) : '';
  r.last = s;
}

function setPhase(phase) {
  ui.state.tone = { idle: 'neutral', running: 'busy', done: 'ok', failed: 'danger' }[phase];
  ui.state.textContent = t.job[phase];
  ui.live.textContent = t.job[phase];
  ui.start.busy = phase === 'running';
  ui.start.textContent = phase === 'idle' ? t.deploy : t.again;
}

ui.start.addEventListener('click', async () => {
  if (ui.start.busy) return;
  attempt++;
  failedStep = undefined;
  ui.log.code = '';
  setPhase('running');
  const final = await simulateTargets(keys, {
    parallel: 1,
    stepMs: 300,
    fail: (key) => key === 'push' && attempt === 1,
    skip: () => !!failedStep,
    onUpdate: (list) => {
      for (const s of list) {
        if (s.status === 'failed') {
          failedStep ??= s.key;
          s.error = t.error;
        }
        paint(s);
      }
    },
  });
  setPhase(final.some((s) => s.status === 'failed') ? 'failed' : 'done');
});
for (const key of keys) paint({ key, status: 'pending', progress: 0 });
setPhase('idle');
```

## Live updates without losing focus

A job sends many small updates. If every update rebuilt the rows, a focused button would lose focus, open details would close or lose their scroll position, and screen readers would read the rows again. The examples avoid that:

- **Stable rows:** the job table uses markup mode. The script creates every `<tr data-key>` and its `<tr kern-details>` once; the key is the device id, the same value a data-mode table takes from `rowKey`. Expanded rows (`expanded`), the focused expand button and the log's scroll position stay because the elements stay.
- **Change, don't replace:** an update sets properties on the elements that exist: `tone` and text of `kern-status`, `value` of `kern-progress`, `duration` of `kern-time`, `code` of `kern-code`. `paint()` compares with the last painted state and skips what didn't change.
- **Append, don't rebuild:** the scan adds a `kern-list-item` per found device; items already shown are left alone.
- **No jumping rows:** the rows keep their order while the job runs. If your table is sortable, sort on request, not on every update.
- **Focus on removed actions:** when a focused button disappears (Cancel at the end of the job), focus moves to the next action instead of falling back to the page.
- **Quiet announcements:** a `role="status"` element announces phase changes («Running», «Cancelling …», «Finished with errors: 9 updated · 1 failed · 2 skipped»), not every step.
- **Fast backends:** if updates arrive many times a second, collect them and paint once per `requestAnimationFrame`.

Why not data mode? A `kern-table` with `columns` and `rows` builds its rows from the array. Every new `rows` array rebuilds all `<tr>`: it puts focus back on its own checkboxes and toggles, but not on buttons in your cells, and the contents of open detail rows are created anew. That is fine for a page of server data, but not for a job that updates several times a second. Reusing rows by `rowKey` in data mode is proposed in [issue #149](https://github.com/yfridelance/kern/issues/149).

```js Paint only what changed
function paint(s) {
  const r = rows.get(s.key); // elements of the row, created once
  if (s.status !== r.last.status) {
    r.status.tone = TONE[s.status];
    r.status.textContent = t.target[s.status];
  }
  if (s.progress !== r.last.progress) r.progress.value = s.progress;
  r.last = s;
}
```
