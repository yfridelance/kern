# Empty, error and offline states

A list can be empty for different reasons, and each needs its own hint and action: nothing was created yet, the filters match nothing, the data could not be loaded, or the connection dropped while data is already on screen. `kern-empty-state` draws the first three; a `kern-alert` above the existing data covers the last one. Your app decides which state applies, Kern only shows it.

- **Nothing created yet:** `kern-empty-state` with «Add device».
- **Filters match nothing:** `kern-empty-state variant="no-results"` with «Reset filters».
- **First load failed:** `kern-empty-state variant="error"` with «Try again».
- **Still loading:** `kern-table loading` or `kern-skeleton`, never the empty state.
- **Connection lost, data on screen:** `kern-alert tone="warn"` with «Retry» above the unchanged data.

Only the error state is a live region, and it is announced once when it appears. Empty and no-results states are not announced on their own: the user just acted (filtered, opened the page) and finds them in the place of the list. Keep the state element in place while it applies instead of re-creating it, so nothing is read twice.

## Empty for the first time

The server answers, but with no devices. Instead of an empty table, show what the list is for and how to fill it. Here «Add device» adds one example device and the table takes over.

```html
<kern-empty-state hidden>
  Devices you add appear here with their IP, firmware and status.
  <kern-button slot="actions" variant="primary">Add device</kern-button>
</kern-empty-state>
<kern-table hidden></kern-table>
```

```js
const { devices, fakeServer } = await import('../assets/mock.js');
const rows = [];
const server = fakeServer({ rows, delay: 300 });
const empty = root.querySelector('kern-empty-state');
const table = root.querySelector('kern-table');
table.columns = [
  { key: 'name', label: 'Name' },
  { key: 'ip', label: 'IP', mono: true },
  { key: 'firmware', label: 'Firmware', mono: true },
];
const load = async () => {
  const result = await server.query({ pageSize: 10 });
  table.rows = result.rows;
  // Your app decides: no rows without any filter means "nothing created yet".
  empty.hidden = result.total > 0;
  table.hidden = result.total === 0;
};
empty.querySelector('kern-button').addEventListener('click', () => {
  rows.push(devices[rows.length]);
  load();
});
load();
```

## No filter matches

The same list, but filtered. When the filters exclude everything, say so and offer to reset them, rather than suggesting that no devices exist. The toolbar stays, so the user can also change one filter.

```html
<kern-toolbar>
  <kern-input size="sm" type="search" value="sauna" placeholder="Name, IP or MAC" aria-label-text="Search" style="width:200px"></kern-input>
  <kern-select size="sm" aria-label-text="Site" value="Büro Bern" style="width:160px"></kern-select>
  <span slot="end" class="count" style="font-size:13px;color:var(--text-muted)"></span>
</kern-toolbar>
<kern-table controlled="external" page-size="5"></kern-table>
<kern-empty-state variant="no-results" hidden>
  <span class="why"></span>
  <kern-button slot="actions">Reset filters</kern-button>
</kern-empty-state>
```

```js
const { fakeServer, sites } = await import('../assets/mock.js');
const server = fakeServer({ delay: 250 });
const [search, site] = root.querySelectorAll('kern-input, kern-select');
const table = root.querySelector('kern-table');
const empty = root.querySelector('kern-empty-state');
site.options = [{ value: '', label: 'All sites' }, ...sites.map((s) => ({ value: s, label: s }))];
table.columns = [
  { key: 'name', label: 'Name' },
  { key: 'site', label: 'Site' },
  { key: 'ip', label: 'IP', mono: true },
];
const state = { search: search.value, filters: { site: site.value }, page: 1, pageSize: 5 };
let ctrl;
const load = async () => {
  ctrl?.abort();
  ctrl = new AbortController();
  table.loading = true;
  try {
    const { rows, total } = await server.query({ ...state, signal: ctrl.signal });
    Object.assign(table, { rows, total, page: state.page, loading: false });
    root.querySelector('.count').textContent = `${total} devices`;
    const none = total === 0;
    table.hidden = none;
    empty.hidden = !none;
    if (none) root.querySelector('.why').textContent = `No device matches “${state.search}”${state.filters.site ? ` at ${state.filters.site}` : ''}.`;
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
  }
};
search.addEventListener('kernInput', (e) => {
  Object.assign(state, { search: e.detail.value, page: 1 });
  load();
});
site.addEventListener('kernChange', (e) => {
  Object.assign(state, { filters: { site: e.detail.value }, page: 1 });
  load();
});
table.addEventListener('kernPageChange', (e) => {
  Object.assign(state, e.detail);
  load();
});
empty.querySelector('kern-button').addEventListener('click', () => {
  search.value = '';
  site.value = '';
  Object.assign(state, { search: '', filters: {}, page: 1 });
  load();
});
load();
```

## Load error

The first request fails (`failNext()`), so there is nothing to show. The error state says what happened and offers «Try again»; it is announced once as status. The second attempt succeeds.

```html
<kern-table hidden></kern-table>
<kern-empty-state variant="error" hidden>
  <span class="reason"></span>
  <kern-button slot="actions">Try again</kern-button>
</kern-empty-state>
```

```js
const { fakeServer } = await import('../assets/mock.js');
const server = fakeServer({ delay: 400 });
server.failNext();
const table = root.querySelector('kern-table');
const empty = root.querySelector('kern-empty-state');
const retry = empty.querySelector('kern-button');
table.columns = [
  { key: 'name', label: 'Name' },
  { key: 'site', label: 'Site' },
  { key: 'status', label: 'Status' },
];
const load = async () => {
  retry.busy = true;
  table.loading = true;
  try {
    const { rows } = await server.query({ pageSize: 5 });
    Object.assign(table, { rows, loading: false, hidden: false });
    empty.hidden = true;
  } catch (e) {
    empty.querySelector('.reason').textContent = `${e.message}. Check that the server is running.`;
    table.hidden = true;
    empty.hidden = false;
  } finally {
    retry.busy = false;
  }
};
retry.addEventListener('click', load);
load();
```

## Loading is not empty

While a request runs, show the shape of the content, never the empty state: the user would read «No entries yet» and leave. In data mode `kern-table loading` shows skeleton rows when it has no rows yet, and dims the old rows when it has some. Elsewhere use `kern-skeleton`. Only an answer with no rows leads to the empty state.

```html
<kern-toolbar>
  <kern-button size="sm" class="devices">Load devices</kern-button>
  <kern-button size="sm" class="nothing">Load an empty site</kern-button>
</kern-toolbar>
<kern-table loading></kern-table>
<kern-empty-state hidden heading="No devices at this site">Move devices here from another site.</kern-empty-state>
<kern-card heading="Device details" style="margin-top:16px">
  <kern-skeleton lines="3"></kern-skeleton>
</kern-card>
```

```js
const { devices, fakeServer } = await import('../assets/mock.js');
const full = fakeServer({ delay: 1200 });
const none = fakeServer({ rows: [], delay: 1200 });
const table = root.querySelector('kern-table');
const empty = root.querySelector('kern-empty-state');
table.columns = [
  { key: 'name', label: 'Name' },
  { key: 'ip', label: 'IP', mono: true },
  { key: 'firmware', label: 'Firmware', mono: true },
];
table.rowKey = (row) => row.id;
const load = async (server) => {
  table.hidden = false;
  empty.hidden = true;
  table.loading = true;
  const { rows, total } = await server.query({ pageSize: 4 });
  Object.assign(table, { rows, loading: false, hidden: total === 0 });
  empty.hidden = total > 0;
};
root.querySelector('.devices').addEventListener('click', () => load(full));
root.querySelector('.nothing').addEventListener('click', () => load(none));
load(full);
// The card stays a skeleton until its data arrives.
setTimeout(() => {
  const d = devices[0];
  root.querySelector('kern-card').replaceChildren(Object.assign(document.createElement('p'), { textContent: `${d.name}: ${d.model}, firmware ${d.firmware}, ${d.ip}.`, style: 'margin:0' }));
}, 1500);
```

## Connection lost, data kept

The list is already on screen when the server stops answering. Do not replace it with an error state: the data is still useful, only possibly out of date. Keep the table as it is and put a `kern-alert tone="warn"` above it that says since when the data is old, with a «Retry». Remove the alert once a request succeeds. Here the switch takes the pretend server offline (`offline = true`); the page refreshes every 5 seconds.

```html
<kern-toolbar>
  <kern-switch checked>Server reachable</kern-switch>
</kern-toolbar>
<kern-alert tone="warn" heading="Connection lost" hidden style="margin-bottom:12px">
  <p class="since"></p>
  <kern-button size="sm" class="retry" style="margin-top:8px">Retry</kern-button>
</kern-alert>
<kern-table controlled="external" page-size="5"></kern-table>
```

```js
const { fakeServer } = await import('../assets/mock.js');
const server = fakeServer({ delay: 300 });
const alert = root.querySelector('kern-alert');
const retry = alert.querySelector('.retry');
const table = root.querySelector('kern-table');
table.columns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'rssi', label: 'Signal (dBm)', align: 'end' },
];
table.rowKey = (row) => row.id;
const time = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const state = { page: 1, pageSize: 5 };
let loadedAt;
const load = async () => {
  table.loading = true;
  retry.busy = true;
  try {
    const { rows, total } = await server.query(state);
    Object.assign(table, { rows, total, page: state.page });
    loadedAt = new Date();
    alert.hidden = true;
  } catch {
    // Keep rows, page and sort: only say that they may be out of date.
    alert.querySelector('.since').textContent = loadedAt ? `Showing data from ${time(loadedAt)}. It may be out of date.` : 'No data loaded yet.';
    // Show it once; later failures only update the text, so screen readers are not told again.
    alert.hidden = false;
  } finally {
    table.loading = false;
    retry.busy = false;
  }
};
root.querySelector('kern-switch').addEventListener('kernChange', (e) => {
  server.offline = !e.detail.checked;
  load();
});
retry.addEventListener('click', load);
table.addEventListener('kernPageChange', (e) => {
  Object.assign(state, e.detail);
  load();
});
const timer = setInterval(() => (root.isConnected ? load() : clearInterval(timer)), 5000);
load();
```

## In a table and a list

With table markup, put the state into the empty cell: `<td colspan="…" class="empty">` with a `compact` `kern-empty-state`, so the header stays. A table built from data (`columns` and `rows`) only has `label-empty` text for its empty row; for a state with actions, show `kern-empty-state` instead of the table. A `kern-list` without items shows its `empty` text; for a richer state, hide the list and show `kern-empty-state` in its place, here inside a card.

```html
<div style="display:grid;gap:16px">
  <kern-table>
    <table>
      <thead><tr><th>Name</th><th>IP</th><th>Firmware</th></tr></thead>
      <tbody>
        <tr><td colspan="3" class="empty">
          <kern-empty-state compact variant="no-results">
            No device needs a firmware update.
            <kern-button slot="actions" size="sm">Show all devices</kern-button>
          </kern-empty-state>
        </td></tr>
      </tbody>
    </table>
  </kern-table>
  <div class="data">
    <kern-table hidden></kern-table>
    <kern-card>
      <kern-empty-state compact heading="No devices at Ferienwohnung">
        <kern-button slot="actions" size="sm" variant="primary">Add device</kern-button>
      </kern-empty-state>
    </kern-card>
  </div>
  <kern-card heading="Recent events">
    <kern-list flush hidden></kern-list>
    <kern-empty-state compact icon="clock" heading="No events today">Switching, updates and errors of your devices appear here.</kern-empty-state>
  </kern-card>
</div>
```

```js
// Data mode: the app shows the state instead of the table while there are no rows.
const table = root.querySelector('.data kern-table');
table.columns = [
  { key: 'name', label: 'Name' },
  { key: 'ip', label: 'IP', mono: true },
];
table.rows = [];
const showTable = table.rows.length > 0;
table.hidden = !showTable;
root.querySelector('.data kern-card').hidden = showTable;
```
