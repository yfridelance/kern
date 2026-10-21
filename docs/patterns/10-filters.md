# Filters

A device list with a text search, a status and a site filter. The criteria combine (search **and** status **and** site; several values of one filter are alternatives), the active filters show as removable chips, the toolbar shows the number of matches, and «Reset all» clears everything.

Kern provides the controls: `kern-toolbar`, `kern-input type="search"`, `kern-select multiple`, `kern-chip` and `kern-table`. The filter state, the matching and the requests belong to your app, and so do all labels: the examples keep their texts in one `text` object to translate.

Rules that apply to every example:

- **Paging:** every filter change goes back to page 1. The old page number usually does not exist in the new result.
- **Selection:** a filter change keeps the selection. Selected rows that the filters hide stay selected and are counted («3 selected · 1 hidden by filters»), so an action never runs on rows the user cannot see without saying so. Bulk actions and the choice between «this page» and «all matches» are described in the bulk actions pattern (#131).
- **Keyboard:** Tab reaches the search, the selects, each chip's × and «Reset all». Delete or Backspace on a chip removes it; the focus then moves to the next chip, or back to the search when none is left.
- **Responsive:** the toolbar wraps, so on a phone every control takes a full line.

## Local filters

All rows are in the browser: the script filters them and gives the result to the table, which pages it itself. Select a few rows, then filter: the selection stays and the hidden part is counted.

```html
<div style="display:grid;gap:var(--space-3)">
  <kern-toolbar style="margin:0">
    <kern-input type="search" label="Search" placeholder="Name, IP, MAC …" style="flex:2 1 220px"></kern-input>
    <kern-select name="status" label="Status" placeholder="All statuses" multiple style="flex:1 1 180px"></kern-select>
    <kern-select name="site" label="Site" placeholder="All sites" multiple style="flex:1 1 180px"></kern-select>
    <span slot="end" class="count" aria-live="polite" style="color:var(--text-muted);font-size:13px;line-height:var(--control-md)"></span>
  </kern-toolbar>
  <div class="active" hidden>
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)">
      <div class="chips" role="group" aria-label="Active filters" style="display:flex;flex-wrap:wrap;gap:var(--space-2)"></div>
      <kern-button class="reset" size="sm" variant="ghost">Reset all</kern-button>
    </div>
  </div>
  <p class="selection" hidden aria-live="polite" style="margin:0;color:var(--text-muted);font-size:13px"></p>
  <kern-table selectable page-size="10"></kern-table>
  <div class="no-results" hidden>
    <div style="display:grid;justify-items:start;gap:var(--space-2);padding:var(--space-4) 0">
      <strong>No devices match the filters.</strong>
      <kern-button size="sm" class="reset">Reset filters</kern-button>
    </div>
  </div>
</div>
```

```js
const { devices, sites, statuses } = await import('../assets/mock.js');
// All labels come from the app – translate them with your i18n.
const text = {
  status: 'Status',
  site: 'Site',
  search: 'Search',
  count: (n, total) => (n === total ? `${total} devices` : `${n} of ${total} devices`),
  selected: (n, hidden) => `${n} selected${hidden ? ` · ${hidden} hidden by filters` : ''}`,
};
const $ = (s) => root.querySelector(s);
const search = $('kern-input');
const selects = { status: $('[name="status"]'), site: $('[name="site"]') };
const [active, chips, count, selection, table, empty] = ['.active', '.chips', '.count', '.selection', 'kern-table', '.no-results'].map($);

selects.status.options = statuses.map((s) => ({ value: s, label: s }));
selects.site.options = sites.map((s) => ({ value: s, label: s }));
const tones = { online: 'ok', offline: 'danger', update: 'warn' };
table.columns = [
  { key: 'name', label: 'Name', sortable: true, sorted: 'asc' },
  { key: 'status', label: 'Status', sortable: true, cell: (d) => Object.assign(document.createElement('kern-status'), { tone: tones[d.status], textContent: d.status }) },
  { key: 'site', label: 'Site', sortable: true },
  { key: 'ip', label: 'IP', mono: true },
];
table.rowKey = (d) => d.id;

// The filter state is plain data; the controls only show it.
const state = { search: '', status: [], site: [] };
const matches = (d) =>
  (!state.search || [d.name, d.ip, d.mac, d.model].some((v) => v.toLowerCase().includes(state.search.toLowerCase()))) &&
  (!state.status.length || state.status.includes(d.status)) &&
  (!state.site.length || state.site.includes(d.site));

let visible = devices;
let selected = []; // keys, kept across filter changes
function apply() {
  visible = devices.filter(matches);
  table.rows = visible;
  table.page = 1; // back to page 1 after every filter change
  table.hidden = !visible.length;
  empty.hidden = !!visible.length;
  count.textContent = text.count(visible.length, devices.length);
  renderChips();
  renderSelection();
}

function renderChips() {
  const list = [
    ...(state.search ? [['search', state.search]] : []),
    ...state.status.map((v) => ['status', v]),
    ...state.site.map((v) => ['site', v]),
  ];
  chips.replaceChildren(
    ...list.map(([key, value]) => {
      const chip = document.createElement('kern-chip');
      chip.setAttribute('removable', '');
      chip.setAttribute('tone', 'accent');
      chip.setAttribute('value', JSON.stringify([key, value]));
      chip.textContent = `${text[key]}: ${value}`;
      return chip;
    }),
  );
  active.hidden = !list.length;
}

function renderSelection() {
  const shown = new Set(visible.map((d) => d.id));
  const hidden = selected.filter((key) => !shown.has(key)).length;
  selection.hidden = !selected.length;
  selection.textContent = text.selected(selected.length, hidden);
}

search.addEventListener('kernInput', (e) => {
  state.search = e.detail.value.trim();
  apply();
});
for (const [key, select] of Object.entries(selects)) {
  select.addEventListener('kernChange', (e) => {
    state[key] = e.detail.value;
    apply();
  });
}
table.addEventListener('kernSelectionChange', (e) => {
  selected = e.detail.selected;
  renderSelection();
});

chips.addEventListener('kernRemove', async (e) => {
  const index = [...chips.children].indexOf(e.target);
  const [key, value] = JSON.parse(e.detail.value);
  if (key === 'search') search.value = state.search = '';
  else selects[key].value = state[key] = state[key].filter((v) => v !== value);
  apply();
  // Focus: the chip that took its place, else the search.
  const next = chips.children[index];
  if (next) next.setFocus();
  else search.setFocus();
});
for (const button of root.querySelectorAll('.reset')) {
  button.addEventListener('click', () => {
    Object.assign(state, { search: '', status: [], site: [] });
    search.value = '';
    selects.status.value = selects.site.value = [];
    apply();
    search.setFocus();
  });
}
apply();
```

## Server-side filters

With many devices the server filters and pages. The app sends the filter state with every request and shows what comes back. Three things need care:

- **Debounce:** the search waits 300 ms after the last keystroke, so typing «kitchen» sends one request, not seven. Selects and paging load at once. The search text goes into the state at once and only the request waits, so removing a chip while the timer runs keeps the new search.
- **Stale answers:** answers can arrive out of order (the pretend server has `jitter`). Each request aborts the one before with an `AbortController`, so an old answer can never overwrite a newer one. Without `AbortSignal` support, a request counter does the same (see below).
- **Loading and errors:** `loading` keeps the old rows visible under skeletons while a request runs. A failed request shows an alert with «Retry» and leaves the filters as they are. Try it with «Fail next request».

The server contract is your own; here it is `query({ search, filters, sort, page, pageSize, signal })` → `{ rows, total }`. Kern needs only the rows of the page, the total and the loading state.

```html
<div style="display:grid;gap:var(--space-3)">
  <kern-toolbar style="margin:0">
    <kern-input type="search" label="Search" placeholder="Name, IP, MAC …" style="flex:2 1 220px"></kern-input>
    <kern-select name="status" label="Status" placeholder="All statuses" multiple style="flex:1 1 180px"></kern-select>
    <kern-select name="site" label="Site" placeholder="All sites" style="flex:1 1 180px"></kern-select>
    <span slot="end" class="count" aria-live="polite" style="color:var(--text-muted);font-size:13px;line-height:var(--control-md)"></span>
    <kern-button slot="end" class="fail" variant="ghost">Fail next request</kern-button>
  </kern-toolbar>
  <div class="active" hidden>
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)">
      <div class="chips" role="group" aria-label="Active filters" style="display:flex;flex-wrap:wrap;gap:var(--space-2)"></div>
      <kern-button class="reset" size="sm" variant="ghost">Reset all</kern-button>
    </div>
  </div>
  <kern-alert class="error" tone="danger" hidden>
    <span class="message"></span>
    <kern-button class="retry" size="sm" style="margin-left:var(--space-2)">Retry</kern-button>
  </kern-alert>
  <kern-table controlled="external" page-size="5" page-sizes="5,10,25"></kern-table>
  <div class="no-results" hidden>
    <div style="display:grid;justify-items:start;gap:var(--space-2);padding:var(--space-4) 0">
      <strong>No devices match the filters.</strong>
      <kern-button size="sm" class="reset">Reset filters</kern-button>
    </div>
  </div>
</div>
```

```js
const { fakeServer, sites, statuses } = await import('../assets/mock.js');
const server = fakeServer({ delay: 400, jitter: 300 });
const text = {
  status: 'Status',
  site: 'Site',
  search: 'Search',
  count: (n) => (n === 1 ? '1 device' : `${n} devices`),
  loading: 'Loading …',
  error: (message) => `Devices could not be loaded: ${message}`,
};
const $ = (s) => root.querySelector(s);
const search = $('kern-input');
const selects = { status: $('[name="status"]'), site: $('[name="site"]') };
const [active, chips, count, error, table, empty] = ['.active', '.chips', '.count', '.error', 'kern-table', '.no-results'].map($);

selects.status.options = statuses.map((s) => ({ value: s, label: s }));
selects.site.options = [{ value: '', label: 'All sites' }, ...sites.map((s) => ({ value: s, label: s }))];
table.columns = [
  { key: 'name', label: 'Name', sortable: true, sorted: 'asc' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'site', label: 'Site', sortable: true },
  { key: 'ip', label: 'IP', mono: true },
];
table.rowKey = (d) => d.id;

const state = { search: '', status: [], site: '', sort: { key: 'name', direction: 'asc' }, page: 1, pageSize: 5 };
let controller;

async function load() {
  controller?.abort(); // a newer request replaces the running one
  controller = new AbortController();
  const { signal } = controller;
  table.loading = true;
  count.textContent = text.loading;
  try {
    const { rows, total } = await server.query({
      search: state.search,
      filters: { status: state.status, site: state.site },
      sort: state.sort,
      page: state.page,
      pageSize: state.pageSize,
      signal,
    });
    Object.assign(table, { rows, total, page: state.page });
    table.hidden = !total;
    empty.hidden = !!total;
    error.hidden = true;
    count.textContent = text.count(total);
  } catch (err) {
    if (err.name === 'AbortError') return; // stale: a newer request is on its way
    error.querySelector('.message').textContent = text.error(err.message);
    error.hidden = false;
    count.textContent = '';
  } finally {
    if (!signal.aborted) table.loading = false;
  }
}

/** Every filter change: back to page 1, new chips, new request. */
function filtersChanged() {
  state.page = 1;
  renderChips();
  load();
}

function renderChips() {
  const list = [
    ...(state.search ? [['search', state.search]] : []),
    ...state.status.map((v) => ['status', v]),
    ...(state.site ? [['site', state.site]] : []),
  ];
  chips.replaceChildren(
    ...list.map(([key, value]) => {
      const chip = document.createElement('kern-chip');
      chip.setAttribute('removable', '');
      chip.setAttribute('tone', 'accent');
      chip.setAttribute('value', JSON.stringify([key, value]));
      chip.textContent = `${text[key]}: ${value}`;
      return chip;
    }),
  );
  active.hidden = !list.length;
}

let timer;
search.addEventListener('kernInput', (e) => {
  // The state follows every keystroke; only the request waits. So another filter change in between keeps the search.
  state.search = e.detail.value.trim();
  clearTimeout(timer);
  timer = setTimeout(filtersChanged, 300);
});
selects.status.addEventListener('kernChange', (e) => {
  state.status = e.detail.value;
  filtersChanged();
});
selects.site.addEventListener('kernChange', (e) => {
  state.site = e.detail.value;
  filtersChanged();
});
table.addEventListener('kernPageChange', (e) => {
  Object.assign(state, e.detail);
  load();
});
table.addEventListener('kernSort', (e) => {
  state.sort = { key: e.detail.key, direction: e.detail.direction };
  state.page = 1;
  table.columns = table.columns.map((c) => ({ ...c, sorted: c.key === e.detail.key ? e.detail.direction : undefined }));
  load();
});

chips.addEventListener('kernRemove', (e) => {
  const index = [...chips.children].indexOf(e.target);
  const [key, value] = JSON.parse(e.detail.value);
  clearTimeout(timer);
  if (key === 'search') search.value = state.search = '';
  else if (key === 'status') selects.status.value = state.status = state.status.filter((v) => v !== value);
  else selects.site.value = state.site = '';
  filtersChanged();
  const next = chips.children[index];
  if (next) next.setFocus();
  else search.setFocus();
});
for (const button of root.querySelectorAll('.reset')) {
  button.addEventListener('click', () => {
    clearTimeout(timer);
    Object.assign(state, { search: '', status: [], site: '' });
    search.value = '';
    selects.status.value = [];
    selects.site.value = '';
    filtersChanged();
    search.setFocus();
  });
}
$('.retry').addEventListener('click', load);
$('.fail').addEventListener('click', () => server.failNext());
load();
```

```js Request counter
// Instead of an AbortController: only the answer to the latest request is shown.
let latest = 0;
async function load() {
  const request = ++latest;
  table.loading = true;
  try {
    const result = await api.devices(state);
    if (request !== latest) return; // a newer request was sent meanwhile
    Object.assign(table, { rows: result.rows, total: result.total, page: state.page });
  } catch (err) {
    if (request === latest) showError(err);
  } finally {
    if (request === latest) table.loading = false;
  }
}
```

## No results

When nothing matches, say so and offer the way out: a reset action right where the rows would be. Keep the filters and chips visible, so the user sees why the list is empty and can also remove a single filter. This example starts with a search that matches nothing.

```html
<div style="display:grid;gap:var(--space-3)">
  <kern-toolbar style="margin:0">
    <kern-input type="search" label="Search" value="zigbee" style="flex:2 1 220px"></kern-input>
    <span slot="end" class="count" aria-live="polite" style="color:var(--text-muted);font-size:13px;line-height:var(--control-md)"></span>
  </kern-toolbar>
  <div class="active">
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)">
      <kern-chip removable tone="accent">Search: zigbee</kern-chip>
      <kern-button class="reset" size="sm" variant="ghost">Reset all</kern-button>
    </div>
  </div>
  <kern-list class="results" hidden></kern-list>
  <div class="no-results">
    <div style="display:grid;justify-items:start;gap:var(--space-2);padding:var(--space-4) 0">
      <strong class="message">No devices match “zigbee”.</strong>
      <span style="color:var(--text-muted)">Check the spelling or search for a name or IP address.</span>
      <kern-button size="sm" class="reset">Reset filters</kern-button>
    </div>
  </div>
</div>
```

```js
const { devices } = await import('../assets/mock.js');
const text = {
  count: (n, total) => (n === total ? `${total} devices` : `${n} of ${total} devices`),
  chip: (q) => `Search: ${q}`,
  none: (q) => `No devices match “${q}”.`,
};
const $ = (s) => root.querySelector(s);
const [search, count, active, chip, list, empty] = ['kern-input', '.count', '.active', 'kern-chip', '.results', '.no-results'].map($);

function apply() {
  const q = search.value.trim().toLowerCase();
  const rows = devices.filter((d) => !q || d.name.toLowerCase().includes(q) || d.ip.includes(q));
  list.replaceChildren(...rows.slice(0, 5).map((d) => Object.assign(document.createElement('kern-list-item'), { heading: d.name, description: d.ip })));
  list.hidden = !rows.length;
  empty.hidden = !!rows.length;
  empty.querySelector('.message').textContent = text.none(search.value.trim());
  active.hidden = !q;
  chip.textContent = text.chip(search.value.trim());
  count.textContent = text.count(rows.length, devices.length);
}
const reset = () => {
  search.value = '';
  apply();
  search.setFocus();
};
for (const button of root.querySelectorAll('.reset')) button.addEventListener('click', reset);
chip.addEventListener('kernRemove', reset);
search.addEventListener('kernInput', apply);
apply();
```
