# Bulk actions

Select devices in a server-paged list and run one action on all of them: reboot, update, remove. The pattern keeps three things apart that are easy to confuse: the rows checked **on this page**, the rows checked **anywhere** (other pages, outside the current filter), and **all devices matching the filter** – the last one is a separate, explicit choice. The result is shown per device, split into done, failed and skipped, and only the failed ones can be retried.

Kern provides the table with its checkboxes, the toolbars, `confirm()`, the busy button and the result lists. Your app owns the selection state, the filter snapshot, what an action does, which devices it skips and whether a retry is possible. Rows need a stable key (`rowKey`, here the device `id`): with server paging the table gets new row objects on every page, and only the key ties a checked box to the same device.

## Device list with bulk actions

Check a few rows, page on and check more: the selection bar says how many are selected and how many of them are not visible. Check the header box to select this page; then “Select all … matching devices” selects the whole filter result. **Reboot** asks for confirmation and skips offline devices, **Update firmware** runs without asking and skips devices that are up to date, **Remove** asks you to type the number of devices. Some devices fail on purpose; “Retry failed” runs the action again for those only.

```html
<div class="stack bulk-demo">
  <kern-toolbar>
    <kern-input size="sm" type="search" placeholder="Name, IP or MAC" aria-label-text="Search devices" data-filter="search" style="width:220px"></kern-input>
    <kern-select size="sm" aria-label-text="Site" value="all" data-filter="site" style="width:180px">
      <option value="all">All sites</option>
      <option>Haus Seeblick</option>
      <option>Ferienwohnung</option>
      <option>Büro Bern</option>
    </kern-select>
    <span slot="end" data-total style="font-size:13px;color:var(--text-muted)"></span>
  </kern-toolbar>
  <kern-toolbar role="group" aria-label="Selection" style="align-items:center;margin-bottom:0">
    <span data-summary tabindex="-1" aria-live="polite" style="font-size:13px">No devices selected</span>
    <kern-button size="sm" variant="ghost" data-select-all hidden></kern-button>
    <kern-button size="sm" variant="ghost" data-clear hidden>Clear selection</kern-button>
    <span slot="end" style="display:flex;flex-wrap:wrap;gap:8px">
      <kern-button size="sm" data-action="reboot" disabled>Reboot</kern-button>
      <kern-button size="sm" data-action="update" disabled>Update firmware</kern-button>
      <kern-button size="sm" variant="danger" data-action="remove" disabled>Remove</kern-button>
    </span>
  </kern-toolbar>
  <kern-table selectable controlled="external" page-size="10" page-sizes="10,25" label-select-all="Select all devices on this page" label-select-row="Select device"></kern-table>
  <section data-results aria-labelledby="bulk-result-title" hidden>
    <div class="stack">
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px">
        <h4 id="bulk-result-title" tabindex="-1" style="margin:0;font-size:14px"></h4>
        <span style="flex:1"></span>
        <kern-button size="sm" data-retry hidden></kern-button>
        <kern-button size="sm" variant="ghost" data-dismiss>Dismiss</kern-button>
      </div>
      <kern-progress label="Progress"></kern-progress>
      <p data-outcome aria-live="polite" style="margin:0;font-size:13px;color:var(--text-muted)"></p>
      <kern-list size="sm" heading="Failed" data-group="failed" hidden></kern-list>
      <kern-list size="sm" heading="Skipped" data-group="skipped" hidden></kern-list>
      <kern-accordion data-group-wrap="done" hidden>
        <kern-accordion-item>
          <kern-list size="sm" flush data-group="done"></kern-list>
        </kern-accordion-item>
      </kern-accordion>
    </div>
  </section>
</div>
```

```js
const { devices, fakeServer, simulateTargets } = await import('../assets/mock.js');
const { confirm } = await import('../kern/index.esm.js');
const $ = (s) => root.querySelector(s);
const table = $('kern-table');
const summary = $('[data-summary]');
const selectAllButton = $('[data-select-all]');
const clearButton = $('[data-clear]');
const actionButtons = [...root.querySelectorAll('[data-action]')];

// The pretend backend works on a copy, so “Remove” can delete devices from it.
const inventory = devices.map((d) => ({ ...d }));
const server = fakeServer({ rows: inventory, delay: 250 });

const TONE = { online: 'ok', offline: 'danger', update: 'warn' };
const STATUS = { online: 'Online', offline: 'Offline', update: 'Update available' };
const status = (tone, text) => Object.assign(document.createElement('kern-status'), { tone, textContent: text });
table.columns = [
  { key: 'name', label: 'Name', sortable: true, sorted: 'asc' },
  { key: 'site', label: 'Site', sortable: true },
  { key: 'status', label: 'Status', cell: (d) => status(TONE[d.status], STATUS[d.status]) },
  { key: 'firmware', label: 'Firmware', mono: true },
];
table.rowKey = (d) => d.id;

/** Request state: filter, sort and page. */
const query = { search: '', filters: {}, sort: { key: 'name', direction: 'asc' }, page: 1, pageSize: 10 };
/** The current page as the server returned it. */
let current = { rows: [], total: 0 };
/** Devices seen so far by key, for the names of selected devices that are not on this page. */
const known = new Map();
/**
 * Either explicit keys, or “all devices matching `filter`” (a snapshot of the filter, not a list of IDs)
 * minus the rows unchecked afterwards.
 */
let selection = { mode: 'keys', keys: [] };
let notice = '';
let running = false;
/** The last run: action and one result per device. */
let run = null;

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const isSelected = (key) => (selection.mode === 'all' ? !selection.except.has(key) : selection.keys.includes(key));
const selectedCount = () => (selection.mode === 'all' ? selection.total - selection.except.size : selection.keys.length);
const describe = (f) => {
  const parts = [f.filters.site && `site “${f.filters.site}”`, f.search && `search “${f.search}”`].filter(Boolean);
  return parts.length ? ` matching ${parts.join(', ')}` : '';
};

/** Selection bar, action buttons and the checkboxes of this page from `selection`. */
function render() {
  const focused = root.contains(document.activeElement) ? document.activeElement : null;
  const count = selectedCount();
  const visible = current.rows.filter((d) => isSelected(d.id)).length;
  const hidden = count - visible;
  table.selected = selection.mode === 'all' ? current.rows.map((d) => d.id).filter(isSelected) : selection.keys;

  let text;
  if (selection.mode === 'all') {
    text = `All ${plural(count, 'device')}${describe(selection.filter)} selected`;
    if (selection.except.size) text += ` (${selection.except.size} unchecked)`;
  } else {
    text = count ? `${count} selected` : 'No devices selected';
    if (hidden) text += `, ${hidden} not visible`;
  }
  summary.textContent = notice ? `${notice} ${text}` : text;

  // Offer the whole filter result only once this page is fully checked and there is more than this page.
  const pageChecked = current.rows.length > 0 && visible === current.rows.length;
  selectAllButton.hidden = selection.mode === 'all' || !pageChecked || current.total <= current.rows.length;
  selectAllButton.textContent = `Select all ${current.total} matching devices`;
  clearButton.hidden = count === 0;
  for (const b of actionButtons) b.disabled = running || count === 0;
  $('[data-total]').textContent = plural(current.total, 'device');

  // A button that disappears or gets disabled must not take the focus with it.
  if (focused && (focused.hidden || focused.disabled) && !focused.busy) summary.focus();
}

let loading;
async function load() {
  loading?.abort();
  const ctrl = (loading = new AbortController());
  table.loading = true;
  try {
    const res = await server.query({ ...query, signal: ctrl.signal });
    if (!res.rows.length && query.page > 1) {
      query.page = 1;
      return load();
    }
    current = res;
    for (const d of res.rows) known.set(d.id, d);
    Object.assign(table, { rows: res.rows, total: res.total, page: query.page, loading: false });
    render();
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
  }
}

table.addEventListener('kernSelectionChange', (e) => {
  notice = '';
  if (selection.mode === 'all') {
    // The header box and row boxes only change rows of this page: remember them as exceptions.
    const checked = new Set(e.detail.selected);
    for (const d of current.rows) checked.has(d.id) ? selection.except.delete(d.id) : selection.except.add(d.id);
    if (selectedCount() === 0) selection = { mode: 'keys', keys: [] };
  } else {
    selection = { mode: 'keys', keys: e.detail.selected };
  }
  render();
});
table.addEventListener('kernPageChange', (e) => {
  Object.assign(query, e.detail);
  load();
});
table.addEventListener('kernSort', (e) => {
  query.sort = { key: e.detail.key, direction: e.detail.direction };
  query.page = 1;
  table.columns = table.columns.map((c) => ({ ...c, sorted: c.key === e.detail.key ? e.detail.direction : undefined }));
  load();
});

/** A new filter ends “all matching”: the snapshot no longer describes what the list shows. Explicit picks stay. */
function setFilter(patch) {
  Object.assign(query, patch, { page: 1 });
  if (selection.mode === 'all') {
    selection = { mode: 'keys', keys: [] };
    notice = 'Filter changed, selection cleared.';
  } else notice = '';
  load();
}
let typing;
$('[data-filter="search"]').addEventListener('kernInput', (e) => {
  clearTimeout(typing);
  typing = setTimeout(() => setFilter({ search: e.detail.value.trim() }), 250);
});
$('[data-filter="site"]').addEventListener('kernChange', (e) => {
  setFilter({ filters: e.detail.value === 'all' ? {} : { site: e.detail.value } });
});

selectAllButton.addEventListener('click', () => {
  selection = { mode: 'all', filter: { search: query.search, filters: { ...query.filters } }, total: current.total, except: new Set() };
  notice = '';
  render();
  clearButton.focus();
});
clearButton.addEventListener('click', () => {
  selection = { mode: 'keys', keys: [] };
  notice = '';
  render();
});

/** What each action does, which devices it skips (and why) and how it is confirmed. */
const ACTIONS = {
  reboot: {
    title: 'Reboot',
    skip: (d) => d.status === 'offline' && 'Offline, cannot be reached',
    confirm: (n) => ({ heading: `Reboot ${plural(n, 'device')}?`, message: 'They are unreachable for about a minute.', confirmLabel: 'Reboot', cancelLabel: 'Cancel' }),
  },
  update: {
    title: 'Firmware update',
    skip: (d) => (d.status === 'offline' ? 'Offline, cannot be reached' : d.status !== 'update' && 'Already up to date'),
  },
  remove: {
    title: 'Remove',
    confirm: (n) => ({
      heading: `Remove ${plural(n, 'device')}?`,
      message: 'They are removed from the inventory with their settings. This cannot be undone.',
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      danger: true,
      typeToConfirm: String(n),
      typeToConfirmLabel: `Type ${n} to confirm`,
    }),
  },
};

/** A copy of the selection, taken when an action starts: later clicks in the list must not change a running job. */
const snapshot = (sel) =>
  sel.mode === 'keys' ? { mode: 'keys', keys: [...sel.keys] } : { mode: 'all', filter: structuredClone(sel.filter), except: new Set(sel.except) };

/** Devices behind a selection snapshot. For “all matching” the server resolves the filter now. */
async function targets(sel) {
  if (sel.mode === 'keys') return sel.keys.map((k) => known.get(k)).filter(Boolean);
  const { rows } = await server.query({ ...sel.filter, sort: query.sort, page: 1, pageSize: 10_000 });
  for (const d of rows) known.set(d.id, d);
  return rows.filter((d) => !sel.except.has(d.id));
}

/** In this demo about every sixth device times out, a few of them also on retry. */
const flaky = (key, retry) => parseInt(key.slice(-2), 16) % (retry ? 24 : 6) === 0;

async function execute(name, button, retryOf) {
  if (running) return; // no second run while one is open, also not from a second click during confirm
  running = true;
  render();
  const action = ACTIONS[name];
  let started = false;
  try {
    button.busy = true;
    const list = retryOf ?? (await targets(snapshot(selection)));
    button.busy = false;
    if (!list.length) return;
    if (action.confirm && !retryOf && !(await confirm(action.confirm(list.length)))) return;
    button.busy = true;

    const reasons = new Map(list.map((d) => [d.id, action.skip?.(d)]).filter(([, r]) => r));
    if (!retryOf) run = { name, results: new Map(list.map((d) => [d.id, { device: d, status: 'pending' }])) };
    started = true;
    showResults(true);
    const states = await simulateTargets(list.map((d) => d.id), {
      parallel: 4,
      stepMs: 120,
      skip: (key) => reasons.has(key),
      fail: (key) => flaky(key, !!retryOf),
      onUpdate: (s) => progress(s),
    });
    for (const s of states) {
      const r = run.results.get(s.key);
      Object.assign(r, { status: s.status, reason: s.status === 'skipped' ? reasons.get(s.key) : s.error });
    }
    if (name === 'remove') await removeDone(states);
  } finally {
    button.busy = false;
    running = false;
    render();
    if (started) showResults(false);
  }
}

/** Removed devices leave the backend, the list and the selection. */
async function removeDone(states) {
  const gone = new Set(states.filter((s) => s.status === 'done').map((s) => s.key));
  for (let i = inventory.length - 1; i >= 0; i--) if (gone.has(inventory[i].id)) inventory.splice(i, 1);
  const sel = selection;
  if (sel.mode === 'keys') sel.keys = sel.keys.filter((k) => !gone.has(k));
  else {
    const { total } = await server.query({ ...sel.filter, pageSize: 1 });
    if (sel === selection) sel.total = total; // unless the user changed the selection meanwhile
  }
  await load();
}

for (const b of actionButtons) b.addEventListener('click', () => execute(b.dataset.action, b));
$('[data-retry]').addEventListener('click', (e) => {
  const failed = [...run.results.values()].filter((r) => r.status === 'failed').map((r) => r.device);
  execute(run.name, e.currentTarget, failed);
});
$('[data-dismiss]').addEventListener('click', () => {
  $('[data-results]').hidden = true;
  summary.focus();
});

const progressBar = $('kern-progress');
function progress(states) {
  const finished = states.filter((s) => !['pending', 'running'].includes(s.status)).length;
  Object.assign(progressBar, { value: finished, max: states.length, valueText: `${finished} of ${states.length}` });
}

/** Result panel: while running only the progress, afterwards one list per outcome. */
function showResults(busy) {
  const results = [...run.results.values()];
  const by = (st) => results.filter((r) => r.status === st);
  const failed = by('failed');
  const panel = $('[data-results]');
  const title = $('#bulk-result-title');
  panel.hidden = false;
  title.textContent = `${ACTIONS[run.name].title}: ${plural(results.length, 'device')}`;
  progressBar.hidden = !busy;
  const outcome = `${by('done').length} done, ${failed.length} failed, ${by('skipped').length} skipped`;
  $('[data-outcome]').textContent = busy ? 'Running…' : outcome;

  const retry = $('[data-retry]');
  retry.hidden = busy || !failed.length;
  retry.textContent = `Retry ${failed.length} failed`;
  retry.disabled = running;
  $('[data-dismiss]').disabled = busy;

  // The group heading names the outcome; each row gets the device, its site and the error or reason.
  const fill = (st) => {
    const list = root.querySelector(`[data-group="${st}"]`);
    const items = busy ? [] : by(st);
    list.replaceChildren(
      ...items.map((r) => Object.assign(document.createElement('kern-list-item'), { heading: r.device.name, description: r.reason ?? '', meta: r.device.site })),
    );
    return items.length;
  };
  $('[data-group="failed"]').hidden = !fill('failed');
  $('[data-group="skipped"]').hidden = !fill('skipped');
  const done = fill('done');
  $('[data-group-wrap="done"]').hidden = !done;
  $('kern-accordion-item').heading = `Done (${done})`;
  if (!busy) title.focus();
}

load();
```

## What the header checkbox selects

The header checkbox keeps its meaning in every case: it checks or unchecks the **visible rows of this page**. It never reaches rows on other pages or outside the filter, because the table only knows the page it shows. Selecting more than the page is a separate action with a label that names the number: “Select all 42 matching devices”. The demo offers it only after the page is fully checked and the filter result has more rows than the page.

“All matching” is stored as a snapshot of the filter (`{ search, filters }`) plus the rows unchecked afterwards – not as a list of IDs. The app never loads all IDs into the page; the server resolves the snapshot when the action runs, so the confirmation shows the number that will really be affected.

```js Selection state
// Explicit picks: the keys the table reports in kernSelectionChange.
{ mode: 'keys', keys: ['A8032A169338', 'A8032ADFFEDA'] }
// Everything matching a filter, minus rows unchecked afterwards.
{ mode: 'all', filter: { search: '', filters: { site: 'Büro Bern' } }, total: 20, except: Set {'A8032A1723F3'} }
```

## Selected rows you cannot see

Keys of rows that are not shown stay in `selected` (see [kern-table](../components/kern-table.html)). An action must never include devices silently, so the selection bar always says how many selected devices are not visible on this page: “3 selected, 1 not visible”. The confirmation names the full count. To show where they are, an app can add a “Show selected” filter (the pretend server accepts `filters: { id: keys }`).

The count of hidden rows comes from the app: `selected` minus the selected keys among the current rows. Keep a map of devices you have seen (`known` in the demo) to show names in the results for rows that are no longer on screen.

## When the filter changes

- **Explicit picks stay.** Rows that drop out of the result are still selected and counted as “not visible”. This matches the table, which keeps keys of rows it does not show, and lets the user collect devices across several searches.
- **“All matching” ends.** The snapshot describes the old filter, so running an action on it would hit devices the user no longer sees. The demo clears the selection and says so in the selection bar (“Filter changed, selection cleared.”). Sorting and paging keep it, because they do not change which devices match.
- **The page goes back to 1**, as in the Filters pattern.

If your app prefers to keep “all matching” across a filter change, update the snapshot and the count from the new result and show the new number – never keep an old snapshot with a new list.

## Running the action

- **Confirm when it matters.** A reboot asks with `confirm()`; removing devices uses `typeToConfirm` with the number of devices, so the user has to read the scope. A harmless action (the firmware update skips devices that are up to date) runs at once.
- **No double start.** The clicked button is `busy` while the targets are resolved and while the job runs; the other action buttons are disabled. The handler also returns early while a run is open, because a click can arrive before the button re-renders. `busy` on kern-button ignores clicks on its own.
- **Freeze the scope.** The action copies the selection (keys, or filter and exceptions) when it starts and resolves its targets from that copy. Clearing the selection or changing the filter while the targets load or the job runs does not change the job.
- **Skips are decided by the app** before the run (offline devices cannot reboot) and shown with their reason.
- **Long jobs** with cancel and live progress per device are covered in the Jobs pattern.

## Results and retry

The result panel lists failed devices first, with the error, then skipped ones with the reason; successful devices sit in a collapsed group. “Retry 2 failed” runs the same action again for exactly those devices, without asking again: the user has already confirmed the action for them. Retry replaces their result in place, so the summary always describes the whole run. Offer retry only for errors your app can retry (a timeout, not a permission error).

After **Remove** the done devices leave the list and the selection; failed ones stay selected, so the user can retry or act on them otherwise. When nothing is selected or the request for the list itself fails, see the States pattern.

## Keyboard and small screens

Every control is a button, checkbox or field in reading order: filters, selection bar, actions, table, results. When a focused button disappears (“Select all … matching” after use, “Clear selection”) the focus moves to the selection summary, which is announced through `aria-live`; after a run it moves to the result heading. Both toolbars wrap on narrow screens, and the table scrolls sideways inside its box.
