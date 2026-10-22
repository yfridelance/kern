# Device overview

A complete admin screen built from the other patterns: an app frame with side navigation, key figures, a filter toolbar, a server-paged device table with selection, detail rows and a bulk action, and every state a list can be in. It shows how the pieces fit together; each piece is explained on its own pattern page, so the code here stays short where that page has the details.

- **Layout:** `kern-app-shell` with `kern-topbar` and a side navigation, `kern-grid` with `kern-stat` tiles.
- **Filters and paging:** search, status and site, active filters as `kern-chip`, filtered and paged on the server. See [Filters](filters.html).
- **Selection and details:** stable row keys, a selection bar with a bulk action, detail rows. See [Bulk actions](bulk-actions.html) and [Jobs](jobs.html).
- **States:** loading, no devices yet, no matches, load error with retry, and a banner when a refresh fails while data is on screen. See [States](states.html).

Kern draws all of it. The data, the requests, the filter and selection state, what «Reboot» does, which devices it skips, and every text belong to your app. Here the app is the script below, and `fakeServer()` from `docs/assets/mock.js` plays the backend with fixed example data.

## Devices

The controls above the frame are not part of the app: they let you take the pretend server offline, empty the inventory, make the next request fail and switch the language. Try them in different orders: with data on screen a failed refresh shows a banner and keeps the rows; without data it shows the error state with «Try again». Narrow the window to see the sidebar become a drawer behind the menu button.

```html
<style>
  .ov-shell { min-height: 720px; border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; }
  .ov-main { display: grid; gap: var(--space-4); }
  .ov-row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
  .ov-muted { color: var(--text-muted); font-size: 13px; }
  .ov-toolbar { margin: 0; }
</style>
<kern-toolbar role="group" aria-label="Demo controls">
  <kern-switch class="ov-online" checked>Server reachable</kern-switch>
  <kern-switch class="ov-inventory" checked>Devices in inventory</kern-switch>
  <kern-button size="sm" variant="ghost" class="ov-fail">Fail next request</kern-button>
  <kern-switch slot="end" class="ov-de">Deutsch</kern-switch>
</kern-toolbar>
<kern-app-shell class="ov-shell" breakpoint="720" width="full">
  <kern-topbar slot="topbar" app-name="Shelly Manager" home-href="#"></kern-topbar>
  <div slot="sidebar">
    <kern-list variant="nav" heading="Home" data-t="heading:navHome">
      <kern-list-item heading="Overview" href="#overview" data-t="heading:navOverview"><kern-icon slot="start" name="home"></kern-icon></kern-list-item>
      <kern-list-item heading="Devices" href="#devices" current data-t="heading:navDevices">
        <kern-icon slot="start" name="power"></kern-icon>
        <kern-badge slot="meta" mono class="ov-nav-count" hidden></kern-badge>
      </kern-list-item>
      <kern-list-item heading="Updates" href="#updates" data-t="heading:navUpdates"><kern-icon slot="start" name="refresh"></kern-icon></kern-list-item>
      <kern-list-item heading="Settings" href="#settings" data-t="heading:navSettings"><kern-icon slot="start" name="settings"></kern-icon></kern-list-item>
    </kern-list>
  </div>
  <div class="ov-main">
    <kern-page-header heading="Devices" data-t="heading:navDevices"></kern-page-header>
    <p class="ov-elsewhere" hidden data-t="elsewhere">This page is not part of the example. Open «Devices».</p>
    <div class="ov-devices ov-main">
      <kern-alert tone="warn" class="ov-stale" heading="Data may be out of date" data-t="heading:staleHeading" hidden>
        <span class="ov-stale-text"></span>
        <kern-button size="sm" class="ov-retry" style="margin-left:var(--space-2)" data-t="retry">Retry</kern-button>
      </kern-alert>
      <kern-grid min="120px" gap="sm">
        <kern-stat data-stat="all" label="Devices" value="–"></kern-stat>
        <kern-stat data-stat="online" label="Online" value="–"></kern-stat>
        <kern-stat data-stat="offline" label="Offline" value="–"></kern-stat>
        <kern-stat data-stat="update" label="Updates available" value="–"></kern-stat>
      </kern-grid>
      <kern-toolbar class="ov-toolbar">
        <kern-input type="search" label="Search" placeholder="Name, IP, MAC …" data-t="label:search placeholder:searchHint" style="flex:2 1 220px"></kern-input>
        <kern-select name="status" label="Status" placeholder="All statuses" multiple data-t="label:status placeholder:allStatuses" style="flex:1 1 170px"></kern-select>
        <kern-select name="site" label="Site" data-t="label:site" style="flex:1 1 170px"></kern-select>
        <span slot="end" class="ov-count ov-muted" aria-live="polite" style="line-height:var(--control-md)"></span>
      </kern-toolbar>
      <div class="ov-active" hidden>
        <div class="ov-row">
          <div class="ov-chips ov-row" role="group" aria-label="Active filters"></div>
          <kern-button size="sm" variant="ghost" class="ov-reset" data-t="resetAll">Reset all</kern-button>
        </div>
      </div>
      <kern-toolbar role="group" aria-label="Selection" class="ov-toolbar" style="align-items:center">
        <span class="ov-selection ov-muted" tabindex="-1" aria-live="polite"></span>
        <kern-button size="sm" variant="ghost" class="ov-clear" hidden data-t="clear">Clear selection</kern-button>
        <kern-button slot="end" size="sm" class="ov-reboot" disabled data-t="reboot">Reboot</kern-button>
      </kern-toolbar>
      <kern-table class="ov-table" selectable controlled="external" page-size="10" page-sizes="10,25"></kern-table>
      <kern-empty-state class="ov-empty" hidden>
        <span data-t="emptyText">Devices appear here once they are discovered in your network.</span>
        <kern-button slot="actions" variant="primary" class="ov-scan" data-t="scan">Scan network</kern-button>
      </kern-empty-state>
      <kern-empty-state class="ov-none" variant="no-results" hidden>
        <span class="ov-none-text"></span>
        <kern-button slot="actions" class="ov-reset" data-t="resetFilters">Reset filters</kern-button>
      </kern-empty-state>
      <kern-empty-state class="ov-error" variant="error" hidden>
        <span class="ov-error-text"></span>
        <kern-button slot="actions" class="ov-retry" data-t="tryAgain">Try again</kern-button>
      </kern-empty-state>
    </div>
  </div>
</kern-app-shell>
```

```js
const { devices, sites, statuses, fakeServer, simulateTargets } = await import('../assets/mock.js');
const { confirm, toast, setKernLocale } = await import('../kern/index.esm.js');

// ---------- texts: your app's i18n (Kern's own texts follow setKernLocale) ----------
const TEXTS = {
  en: {
    navHome: 'Home', navOverview: 'Overview', navDevices: 'Devices', navUpdates: 'Updates', navSettings: 'Settings',
    elsewhere: 'This page is not part of the example. Open «Devices».',
    search: 'Search', searchHint: 'Name, IP, MAC …', status: 'Status', allStatuses: 'All statuses', site: 'Site', allSites: 'All sites',
    resetAll: 'Reset all', resetFilters: 'Reset filters', clear: 'Clear selection', reboot: 'Reboot', cancel: 'Cancel',
    retry: 'Retry', tryAgain: 'Try again', scan: 'Scan network', staleHeading: 'Data may be out of date',
    emptyText: 'Devices appear here once they are discovered in your network.',
    states: { online: 'Online', offline: 'Offline', update: 'Update available' },
    stats: { all: 'Devices', online: 'Online', offline: 'Offline', update: 'Updates available' },
    cols: { name: 'Name', status: 'Status', site: 'Site', ip: 'IP', firmware: 'Firmware' },
    detail: { model: 'Model', mac: 'MAC', signal: 'Signal', seen: 'Last seen' },
    count: (n) => (n === 1 ? '1 device' : `${n} devices`),
    loading: 'Loading …',
    selected: (n, hidden) => (n ? `${n} selected${hidden ? `, ${hidden} not visible` : ''}` : 'No devices selected'),
    none: (q) => (q ? `No device matches “${q}” with these filters.` : 'No device matches these filters.'),
    loadError: (m) => `${m}. Check that the server is running.`,
    stale: (m, at) => `${m}. Showing data from ${at}.`,
    rebootAsk: (n) => `Reboot ${n === 1 ? '1 device' : `${n} devices`}?`,
    rebootHint: 'They are unreachable for about a minute. Offline devices are skipped.',
    rebooted: (done, failed, skipped) => `Reboot finished: ${done} done, ${failed} failed, ${skipped} skipped.`,
  },
  de: {
    navHome: 'Start', navOverview: 'Übersicht', navDevices: 'Geräte', navUpdates: 'Updates', navSettings: 'Einstellungen',
    elsewhere: 'Diese Seite gehört nicht zum Beispiel. Öffne «Geräte».',
    search: 'Suche', searchHint: 'Name, IP, MAC …', status: 'Status', allStatuses: 'Alle Status', site: 'Standort', allSites: 'Alle Standorte',
    resetAll: 'Alle zurücksetzen', resetFilters: 'Filter zurücksetzen', clear: 'Auswahl aufheben', reboot: 'Neu starten', cancel: 'Abbrechen',
    retry: 'Erneut laden', tryAgain: 'Nochmals versuchen', scan: 'Netzwerk scannen', staleHeading: 'Daten sind eventuell veraltet',
    emptyText: 'Geräte erscheinen hier, sobald sie im Netzwerk gefunden werden.',
    states: { online: 'Online', offline: 'Offline', update: 'Update verfügbar' },
    stats: { all: 'Geräte', online: 'Online', offline: 'Offline', update: 'Updates verfügbar' },
    cols: { name: 'Name', status: 'Status', site: 'Standort', ip: 'IP', firmware: 'Firmware' },
    detail: { model: 'Modell', mac: 'MAC', signal: 'Signal', seen: 'Zuletzt gesehen' },
    count: (n) => (n === 1 ? '1 Gerät' : `${n} Geräte`),
    loading: 'Lädt …',
    selected: (n, hidden) => (n ? `${n} ausgewählt${hidden ? `, ${hidden} nicht sichtbar` : ''}` : 'Keine Geräte ausgewählt'),
    none: (q) => (q ? `Kein Gerät passt zu «${q}» mit diesen Filtern.` : 'Kein Gerät passt zu diesen Filtern.'),
    loadError: (m) => `${m}. Prüfe, ob der Server läuft.`,
    stale: (m, at) => `${m}. Angezeigt werden die Daten von ${at}.`,
    rebootAsk: (n) => `${n === 1 ? '1 Gerät' : `${n} Geräte`} neu starten?`,
    rebootHint: 'Sie sind etwa eine Minute nicht erreichbar. Offline-Geräte werden übersprungen.',
    rebooted: (done, failed, skipped) => `Neustart beendet: ${done} erledigt, ${failed} fehlgeschlagen, ${skipped} übersprungen.`,
  },
};
let lang = 'en';
const t = () => TEXTS[lang];

const $ = (s) => root.querySelector(s);
const shell = $('kern-app-shell');
const table = $('.ov-table');
const search = $('kern-input');
const selects = { status: $('[name="status"]'), site: $('[name="site"]') };
const states = { empty: $('.ov-empty'), none: $('.ov-none'), error: $('.ov-error') };
const [stale, chips, active, count, selectionText, clear, reboot] = ['.ov-stale', '.ov-chips', '.ov-active', '.ov-count', '.ov-selection', '.ov-clear', '.ov-reboot'].map($);

// ---------- backend: your API. Here the pretend server, with a switchable inventory ----------
let server;
let statsServer;
function connect(withDevices) {
  const rows = withDevices ? devices : [];
  const offline = server?.offline ?? false;
  server = Object.assign(fakeServer({ rows, delay: 450, jitter: 200 }), { offline });
  statsServer = Object.assign(fakeServer({ rows, delay: 250 }), { offline });
}
connect(true);

// ---------- table: columns, stable keys, detail rows ----------
const TONE = { online: 'ok', offline: 'danger', update: 'warn' };
const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};
function columns() {
  const sorted = (key) => (query.sort.key === key ? query.sort.direction : undefined);
  const c = t().cols;
  table.columns = [
    { key: 'name', label: c.name, sortable: true, sorted: sorted('name') },
    { key: 'status', label: c.status, sortable: true, sorted: sorted('status'), cell: (d) => el('kern-status', { tone: TONE[d.status], textContent: t().states[d.status] }) },
    { key: 'site', label: c.site, sortable: true, sorted: sorted('site') },
    { key: 'ip', label: c.ip, mono: true },
    { key: 'firmware', label: c.firmware, mono: true },
  ];
}
// The device id stays the same on every page and after every request: selection and open rows follow it.
table.rowKey = (d) => d.id;
table.detail = (d) => {
  const x = t().detail;
  const seen = new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d.lastSeen));
  return el('kern-kv', {},
    el('kern-kv-item', { label: x.model }, d.model),
    el('kern-kv-item', { label: x.mac }, el('kern-copy', {}, d.mac.match(/../g).join(':'))),
    el('kern-kv-item', { label: x.signal }, d.rssi === null ? '–' : el('kern-signal', { rssi: d.rssi, label: x.signal })),
    el('kern-kv-item', { label: x.seen }, seen),
  );
};

// ---------- state: plain data owned by the app ----------
const query = { search: '', status: [], site: '', sort: { key: 'name', direction: 'asc' }, page: 1, pageSize: 10 };
let current = { rows: [], total: 0 };
let loadedAt = null;
let selected = [];
const known = new Map(); // devices seen so far, for selected rows on other pages
let running = false;
let controller;
const filtered = () => !!(query.search || query.status.length || query.site);

/** One of: the table (also while loading), or an empty, no-results or error state in its place. */
function show(which) {
  table.hidden = which !== 'table';
  for (const [name, node] of Object.entries(states)) node.hidden = name !== which;
}

async function load() {
  controller?.abort(); // see Filters: a newer request replaces the running one
  const { signal } = (controller = new AbortController());
  if (!current.rows.length) show('table'); // the loading table takes the place of a state
  table.loading = true;
  count.textContent = t().loading;
  try {
    const res = await server.query({ search: query.search, filters: { status: query.status, site: query.site }, sort: query.sort, page: query.page, pageSize: query.pageSize, signal });
    current = res;
    loadedAt = new Date();
    for (const d of res.rows) known.set(d.id, d);
    Object.assign(table, { rows: res.rows, total: res.total, page: query.page, loading: false });
    stale.hidden = true;
    // Your app decides which state applies (see States).
    show(res.total ? 'table' : filtered() ? 'none' : 'empty');
    renderState();
  } catch (err) {
    if (err.name === 'AbortError') return;
    if (current.rows.length) {
      // Data on screen: keep it, say since when it is old.
      stale.querySelector('.ov-stale-text').textContent = t().stale(err.message, loadedAt.toLocaleTimeString(lang));
      stale.hidden = false;
    } else {
      states.error.querySelector('.ov-error-text').textContent = t().loadError(err.message);
      show('error');
    }
    count.textContent = current.rows.length ? t().count(current.total) : '';
  } finally {
    if (!signal.aborted) table.loading = false;
  }
}

/** Key figures: a separate, cheap request. A failure keeps the last values. */
async function loadStats() {
  try {
    const totals = await Promise.all(['', ...statuses].map((s) => statsServer.query({ filters: { status: s }, pageSize: 1 }).then((r) => r.total)));
    const [all, ...rest] = totals;
    const values = { all, ...Object.fromEntries(statuses.map((s, i) => [s, rest[i]])) };
    for (const tile of root.querySelectorAll('kern-stat')) tile.value = values[tile.dataset.stat];
    Object.assign($('.ov-nav-count'), { textContent: String(all), hidden: false });
  } catch {
    // the banner of the device request already tells the user
  }
}

// ---------- filters (details in the Filters pattern) ----------
function filtersChanged() {
  query.page = 1;
  renderChips();
  load();
}
function renderChips() {
  const list = [
    ...(query.search ? [['search', query.search, query.search]] : []),
    ...query.status.map((v) => ['status', v, t().states[v]]),
    ...(query.site ? [['site', query.site, query.site]] : []),
  ];
  chips.replaceChildren(...list.map(([key, value, label]) => el('kern-chip', { removable: true, tone: 'accent', value: JSON.stringify([key, value]), textContent: `${t()[key]}: ${label}` })));
  active.hidden = !list.length;
}
let typing;
search.addEventListener('kernInput', (e) => {
  query.search = e.detail.value.trim();
  clearTimeout(typing);
  typing = setTimeout(filtersChanged, 300);
});
selects.status.addEventListener('kernChange', (e) => {
  query.status = e.detail.value;
  filtersChanged();
});
selects.site.addEventListener('kernChange', (e) => {
  query.site = e.detail.value;
  filtersChanged();
});
chips.addEventListener('kernRemove', (e) => {
  const index = [...chips.children].indexOf(e.target);
  const [key, value] = JSON.parse(e.detail.value);
  clearTimeout(typing);
  if (key === 'search') search.value = query.search = '';
  else if (key === 'status') selects.status.value = query.status = query.status.filter((v) => v !== value);
  else selects.site.value = query.site = '';
  filtersChanged();
  const next = chips.children[index];
  next ? next.setFocus() : search.setFocus();
});
for (const button of root.querySelectorAll('.ov-reset')) {
  button.addEventListener('click', () => {
    clearTimeout(typing);
    Object.assign(query, { search: '', status: [], site: '' });
    search.value = '';
    selects.status.value = [];
    selects.site.value = '';
    filtersChanged();
    search.setFocus();
  });
}
table.addEventListener('kernPageChange', (e) => {
  Object.assign(query, e.detail);
  load();
});
table.addEventListener('kernSort', (e) => {
  query.sort = { key: e.detail.key, direction: e.detail.direction };
  query.page = 1;
  columns();
  load();
});

// ---------- selection and a bulk action (details in Bulk actions and Jobs) ----------
function renderSelection() {
  const focused = root.contains(document.activeElement) ? document.activeElement : null;
  const onPage = new Set(current.rows.map((d) => d.id));
  const hidden = selected.filter((k) => !onPage.has(k)).length;
  selectionText.textContent = t().selected(selected.length, hidden);
  clear.hidden = !selected.length;
  reboot.disabled = running || !selected.length;
  if (focused?.hidden) selectionText.focus(); // «Clear selection» must not take the focus with it
}
table.addEventListener('kernSelectionChange', (e) => {
  selected = e.detail.selected; // keys stay selected across pages and filters
  renderSelection();
});
clear.addEventListener('click', () => {
  selected = table.selected = [];
  renderSelection();
});
reboot.addEventListener('click', async () => {
  if (running) return; // no second run, also not from a double click or a click during the confirmation
  running = true; // lock before the first await: confirmation and run are one operation
  const keys = [...selected]; // freeze the scope when the action starts
  renderSelection();
  try {
    const ok = await confirm({ heading: t().rebootAsk(keys.length), message: t().rebootHint, confirmLabel: t().reboot, cancelLabel: t().cancel });
    if (!ok) return;
    reboot.busy = true;
    const result = await simulateTargets(keys, { stepMs: 150, skip: (k) => known.get(k)?.status === 'offline' });
    const n = (s) => result.filter((r) => r.status === s).length;
    toast({ tone: n('failed') ? 'warn' : 'ok', message: t().rebooted(n('done'), n('failed'), n('skipped')) });
  } finally {
    running = false;
    reboot.busy = false;
    renderSelection();
  }
});
// A real scan is a job of its own (see Jobs); here it simply finds the example devices.
$('.ov-scan').addEventListener('click', () => {
  $('.ov-inventory').checked = true;
  connect(true);
  load();
  loadStats();
});

// ---------- navigation: a tiny router, as in kern-app-shell ----------
shell.addEventListener('kernNavigate', (e) => {
  e.preventDefault();
  for (const item of shell.querySelectorAll('kern-list-item[current]')) item.current = false;
  e.target.current = true;
  const devicesPage = e.detail.href.endsWith('#devices');
  $('kern-page-header').dataset.t = `heading:${e.target.dataset.t.split(':')[1]}`;
  $('.ov-devices').hidden = !devicesPage;
  $('.ov-elsewhere').hidden = devicesPage;
  renderTexts();
  shell.focusMain();
});

// ---------- texts: static ones by data-t, dynamic ones from the state ----------
function renderTexts() {
  for (const node of root.querySelectorAll('[data-t]')) {
    for (const pair of node.dataset.t.split(' ')) {
      const [prop, key] = pair.includes(':') ? pair.split(':') : ['textContent', pair];
      node[prop] = t()[key];
    }
  }
  for (const tile of root.querySelectorAll('kern-stat')) tile.label = t().stats[tile.dataset.stat];
  selects.status.options = statuses.map((s) => ({ value: s, label: t().states[s] }));
  selects.site.options = [{ value: '', label: t().allSites }, ...sites.map((s) => ({ value: s, label: s }))];
  renderChips();
  renderState();
}
function renderState() {
  count.textContent = table.loading ? t().loading : t().count(current.total);
  $('.ov-none-text').textContent = t().none(query.search);
  renderSelection();
}

// ---------- demo controls: not part of the app ----------
$('.ov-online').addEventListener('kernChange', (e) => {
  server.offline = statsServer.offline = !e.detail.checked;
  load();
  loadStats();
});
$('.ov-inventory').addEventListener('kernChange', (e) => {
  connect(e.detail.checked);
  current = { rows: [], total: 0 };
  selected = table.selected = [];
  load();
  loadStats();
});
$('.ov-fail').addEventListener('click', () => server.failNext());
$('.ov-de').addEventListener('kernChange', (e) => {
  lang = e.detail.checked ? 'de' : 'en';
  setKernLocale(e.detail.checked ? 'de' : undefined); // Kern texts: pagination, select-all, empty-state headings …
  columns();
  table.expanded = []; // detail rows are built on first open; close them so they come back in the new language
  renderTexts();
});
for (const button of root.querySelectorAll('.ov-retry')) button.addEventListener('click', load);

columns();
renderTexts();
load();
loadStats();
```

## Layout

`kern-app-shell` holds the frame: the topbar stays at the top, the side navigation stands on the left from `breakpoint` and becomes a drawer below it, and `<header>`, `<nav>` and `<main>` are landmarks with a skip link. The navigation is a `kern-list variant="nav"`; a click emits `kernNavigate`, the app routes and calls `focusMain()`. In a real app the shell fills the window; the example sets a `min-height` and a smaller `breakpoint`.

The key figures are `kern-stat` tiles in a `kern-grid min="120px"`: as many columns as fit, without breakpoints, so they wrap from four to two columns on a phone. They come from a separate, cheap request; a failure keeps the last values, because the banner of the device list already says that the data is old.

## Filters and paging

The toolbar, the chips and the request loop are the server-side example of the [Filters](filters.html) pattern: the search waits 300 ms, every filter change goes back to page 1, a newer request aborts the older one, and removing a chip moves the focus to the next chip or the search. The table runs with `controlled="external"`, so it only shows the page the server returned and reports page, page size and sort.

## Selection, details and bulk actions

`rowKey` returns the device `id`. Every page brings new row objects, and only the key ties a checked box or an open detail row to the same device, also after a refresh or a filter change. The selection bar says how many devices are selected and how many of them are not on this page.

«Reboot» is the short version of the [Bulk actions](bulk-actions.html) pattern: it asks with `confirm()`, freezes the selected keys, is `busy` while it runs and ignores a second click from the first click on, also during the confirmation, skips offline devices and reports the outcome in a toast. For a result list per device, retry of failed devices and «select all matching», use that pattern; for long jobs with progress and cancel, see [Jobs](jobs.html).

Detail rows come from `detail`, which builds a `kern-kv` when a row is opened for the first time. Because they are built once, the example closes them when the language changes.

## States

One rule decides what stands in place of the table, as on the [States](states.html) page:

- **Loading:** `kern-table loading` with skeleton rows, or the old rows dimmed. Never an empty state.
- **No devices yet:** the server answers with no rows and no filter is set: `kern-empty-state` with an action that fills the list.
- **No matches:** no rows, but filters are set: `variant="no-results"` with «Reset filters»; toolbar and chips stay.
- **Load error:** a request fails and there is nothing on screen: `variant="error"` with «Try again», announced once.
- **Out of date:** a refresh fails while rows are on screen: a `kern-alert tone="warn"` above them with the time of the last good answer and «Retry». The rows, page, sort and selection stay.

## Language, theme and small screens

- **Language:** `setKernLocale('de')` switches every Kern text at once: pagination, select-all and expand labels, the empty-state headings, the chip remove label, `confirm()`. Your own texts switch with your i18n; here they are one `TEXTS` object, set through `data-t` attributes and the render functions. `setKernLocale()` is global, so it also switches the other examples on this page.
- **Theme:** the frame only uses Kern components and tokens, so the theme toggle in the docs topbar switches it between dark and light.
- **Small screens:** the sidebar becomes a drawer, the stat tiles and the toolbars wrap, and the table scrolls sideways inside its box.

## Where the app takes over

Kern has no data layer. The app owns the API and the request contract (`query({ search, filters, sort, page, pageSize, signal })` here), the filter and selection state, the decision which state applies, what an action does, which devices it skips, the permissions behind the buttons, the router and every text. Replace `fakeServer()` with your own client; the rest of the page stays as it is.
