# Table views

The same device list serves different tasks. For a diagnosis the IP address and the last contact matter, for maintenance the model and the firmware. A **view** stores what a task needs: which columns show in which order, the sort and the filters. Users pick a view, change it, save it under a name, update it later and go back to the default.

Kern provides the parts that touch the table: `columnState` on `kern-table` (show, hide, order and pin columns by key), `kern-table-columns` to edit it, and the controls (`kern-select`, `kern-drawer`, `kern-dialog`, `toast()`). Your app owns the view model, where views are stored (here `localStorage`, usually your backend, per user), which views ship with the app, what the filters mean and every text.

Rules that apply to the example:

- **Views are data.** A view is plain JSON with a version: `{ version, id, name, columns, sort, filters }`. `columns` is a `kern-table` column state, `filters` are your app's own. Nothing in it is a function or a DOM node, so it can be sent to a server as it is.
- **Built-in and saved views.** «All devices», «Offline devices» and «Updates pending» ship with the app and can't be changed; «Save as …» makes a copy. Saved views can be updated and deleted.
- **Modified.** When the columns, the sort or the filters differ from the selected view, the view shows as «modified». «Update view» stores the change in a saved view, «Save as …» in a new one; switching views drops it.
- **Reset** goes back to the default view with the default columns. In the column panel, «Default columns» resets only the columns.
- **Old and broken views.** Column keys the table no longer has are dropped, new columns appear at their place, sort keys and filter values that no longer exist are ignored. A view with an unknown `version` is skipped instead of guessed at; a stored value that is no valid JSON leaves only the built-in views.
- **Paging:** every filter change and every view change goes back to page 1, as in the filters pattern.
- **Keyboard and focus:** the column panel works without a mouse (checkboxes, ↑/↓ buttons or Alt+↑/↓). Closing the panel or the save dialog returns the focus to the button that opened it. After deleting a view, whose button then goes away, the focus moves to the view select.
- **Responsive:** the toolbar wraps; the name column is pinned to the start, so it stays in view when the table scrolls sideways on a phone.

## Device list with views

Pick «Offline devices» or «Updates pending», then change a filter or open «Columns»: the view shows as modified. Save it as your own view and reload the page – it comes back from `localStorage`. «Reset» returns to all devices with the default columns.

```html
<div style="display:grid;gap:var(--space-3)">
  <kern-toolbar style="margin:0">
    <kern-select class="tv-view" label="View" style="flex:1 1 220px"></kern-select>
    <kern-select name="status" label="Status" placeholder="All statuses" multiple style="flex:1 1 180px"></kern-select>
    <kern-select name="site" label="Site" placeholder="All sites" multiple style="flex:1 1 180px"></kern-select>
  </kern-toolbar>
  <div style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)">
    <kern-button size="sm" class="tv-columns">Columns</kern-button>
    <kern-button size="sm" class="tv-update" hidden>Update view</kern-button>
    <kern-button size="sm" class="tv-save">Save as …</kern-button>
    <kern-button size="sm" variant="ghost" class="tv-delete" hidden>Delete view</kern-button>
    <kern-button size="sm" variant="ghost" class="tv-reset">Reset</kern-button>
    <span class="tv-count" aria-live="polite" style="margin-left:auto;color:var(--text-muted);font-size:13px"></span>
  </div>
  <kern-table class="tv-table" page-size="10" compact></kern-table>
</div>
<kern-drawer class="tv-drawer" heading="Columns" width="360">
  <kern-table-columns class="tv-picker" min-visible-columns="2"></kern-table-columns>
  <kern-button slot="footer" variant="ghost" class="tv-default-columns">Default columns</kern-button>
  <kern-button slot="footer" variant="primary" class="tv-done">Done</kern-button>
</kern-drawer>
<kern-dialog class="tv-dialog" heading="Save view" width="400">
  <form id="tv-save-form" novalidate>
    <kern-input name="name" label="Name" required maxlength="40" autocomplete="off" autofocus></kern-input>
  </form>
  <kern-button slot="footer" class="tv-cancel">Cancel</kern-button>
  <kern-button slot="footer" type="submit" form="tv-save-form" variant="primary">Save</kern-button>
</kern-dialog>
```

```js
const { devices, sites, statuses, NOW } = await import('../assets/mock.js');
const { resolveColumnState, toast } = await import('../kern/index.esm.js');
// All labels come from the app – translate them with your i18n.
const text = {
  views: { default: 'All devices', offline: 'Offline devices', updates: 'Updates pending' },
  modified: (name) => `${name} (modified)`,
  count: (n, total) => (n === total ? `${total} devices` : `${n} of ${total} devices`),
  saved: (name) => `View «${name}» saved`,
  updated: (name) => `View «${name}» updated`,
  deleted: (name) => `View «${name}» deleted`,
  nameTaken: 'A view with this name exists already.',
  nameMissing: 'Enter a name.',
  ago: (min) => (min < 60 ? `${min} min ago` : min < 48 * 60 ? `${Math.round(min / 60)} h ago` : `${Math.round(min / 1440)} days ago`),
};
const $ = (s) => root.querySelector(s);
const [table, picker, viewSelect, drawer, dialog, form, count] = ['.tv-table', '.tv-picker', '.tv-view', '.tv-drawer', '.tv-dialog', 'form', '.tv-count'].map($);
const filterSelects = { status: $('[name="status"]'), site: $('[name="site"]') };
const nameInput = form.querySelector('kern-input');
const buttons = { update: $('.tv-update'), save: $('.tv-save'), remove: $('.tv-delete'), reset: $('.tv-reset') };

// ---------- columns: defined once by the app ----------
const tones = { online: 'ok', offline: 'danger', update: 'warn' };
const columns = [
  { key: 'name', label: 'Name', sortable: true, hideable: false, pinned: 'start', minWidth: '150px' },
  { key: 'status', label: 'Status', sortable: true, cell: (d) => Object.assign(document.createElement('kern-status'), { tone: tones[d.status], textContent: d.status }) },
  { key: 'site', label: 'Site', sortable: true, minWidth: '120px' },
  { key: 'ip', label: 'IP', sortable: true, mono: true },
  { key: 'lastSeen', label: 'Last seen', sortable: true, cell: (d) => text.ago(Math.round((NOW - Date.parse(d.lastSeen)) / 60_000)) },
  { key: 'model', label: 'Model', sortable: true, hidden: true, minWidth: '150px' },
  { key: 'firmware', label: 'Firmware', sortable: true, mono: true, hidden: true },
  { key: 'rssi', label: 'Signal (dBm)', sortable: true, align: 'end', hidden: true },
];
filterSelects.status.options = statuses.map((s) => ({ value: s, label: s }));
filterSelects.site.options = sites.map((s) => ({ value: s, label: s }));
picker.columns = columns;
table.rowKey = (d) => d.id;

// ---------- the view model ----------
const VERSION = 1;
const STORAGE = 'kern-docs.table-views';
const builtIn = [
  { version: VERSION, id: 'default', name: text.views.default, columns: [], sort: { key: 'name', direction: 'asc' }, filters: { status: [], site: [] } },
  {
    version: VERSION,
    id: 'offline',
    name: text.views.offline,
    columns: [{ key: 'name', pinned: 'start' }, { key: 'lastSeen' }, { key: 'site' }, { key: 'ip' }, { key: 'status', hidden: true }],
    sort: { key: 'lastSeen', direction: 'asc' },
    filters: { status: ['offline'], site: [] },
  },
  {
    version: VERSION,
    id: 'updates',
    name: text.views.updates,
    columns: [{ key: 'name', pinned: 'start' }, { key: 'firmware' }, { key: 'model' }, { key: 'site' }, { key: 'status', hidden: true }, { key: 'ip', hidden: true }, { key: 'lastSeen', hidden: true }],
    sort: { key: 'firmware', direction: 'asc' },
    filters: { status: ['update'], site: [] },
  },
];

/** A stored view in the current format, or null when it can't be used (another version, broken data). */
function migrate(v) {
  if (!v || typeof v !== 'object' || v.version !== VERSION || typeof v.id !== 'string' || typeof v.name !== 'string') return null;
  const list = (x) => (Array.isArray(x) ? x.map(String) : []);
  return { version: VERSION, id: v.id, name: v.name, columns: Array.isArray(v.columns) ? v.columns : [], sort: v.sort ?? null, filters: { status: list(v.filters?.status), site: list(v.filters?.site) } };
}

/** What a view does with today's columns and values: unknown keys and values dropped, new columns added. */
function resolve(view) {
  const sortable = columns.find((c) => c.key === view.sort?.key && c.sortable);
  return {
    columns: resolveColumnState(columns, view.columns, Number(picker.minVisibleColumns)),
    sort: sortable && ['asc', 'desc'].includes(view.sort.direction) ? { key: sortable.key, direction: view.sort.direction } : null,
    filters: { status: view.filters.status.filter((s) => statuses.includes(s)), site: view.filters.site.filter((s) => sites.includes(s)) },
  };
}

// Persistence belongs to the app: localStorage here, your backend in a real app. Failing storage keeps the built-ins.
function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE) ?? 'null');
    return { saved: (Array.isArray(data?.views) ? data.views : []).map(migrate).filter(Boolean), active: data?.active };
  } catch {
    return { saved: [], active: undefined };
  }
}
function store() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify({ version: VERSION, views: saved, active: active.id }));
  } catch {
    // private mode or full storage: the views still work until the page is left
  }
}

// ---------- state ----------
const stored = load();
let saved = stored.saved;
const all = () => [...builtIn, ...saved];
let active = all().find((v) => v.id === stored.active) ?? builtIn[0];
let current; // what the user sees now: { columns, sort, filters }

const isBuiltIn = (view) => builtIn.includes(view);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const modified = () => !same(current, resolve(active));

/** Shows a view: columns, sort, filters, page 1. */
function apply(view) {
  active = view;
  current = resolve(view);
  table.columns = columns.map((c) => ({ ...c, sorted: c.key === current.sort?.key ? current.sort.direction : undefined }));
  table.columnState = picker.columnState = current.columns;
  for (const [key, select] of Object.entries(filterSelects)) select.value = current.filters[key];
  filter();
  store();
}

function filter() {
  const { status, site } = current.filters;
  const rows = devices.filter((d) => (!status.length || status.includes(d.status)) && (!site.length || site.includes(d.site)));
  table.rows = rows;
  table.page = 1; // every filter or view change starts on page 1
  count.textContent = text.count(rows.length, devices.length);
  render();
}

/** View select and buttons follow the state. */
function render() {
  const changed = modified();
  viewSelect.options = all().map((v) => ({ value: v.id, label: v === active && changed ? text.modified(v.name) : v.name }));
  viewSelect.value = active.id;
  buttons.update.hidden = buttons.remove.hidden = isBuiltIn(active);
}

// ---------- events ----------
viewSelect.addEventListener('kernChange', (e) => apply(all().find((v) => v.id === e.detail.value) ?? builtIn[0]));
for (const [key, select] of Object.entries(filterSelects)) {
  select.addEventListener('kernChange', (e) => {
    current.filters = { ...current.filters, [key]: e.detail.value };
    filter();
  });
}
table.addEventListener('kernSort', (e) => {
  current.sort = { key: e.detail.key, direction: e.detail.direction };
  render();
});
picker.addEventListener('kernColumnsChange', (e) => {
  current.columns = table.columnState = e.detail.state;
  render();
});

$('.tv-columns').addEventListener('click', () => drawer.show());
$('.tv-done').addEventListener('click', () => drawer.close());
$('.tv-default-columns').addEventListener('click', () => {
  current.columns = table.columnState = picker.columnState = resolveColumnState(columns);
  render();
});
buttons.reset.addEventListener('click', () => apply(builtIn[0]));

buttons.update.addEventListener('click', () => {
  Object.assign(active, structuredClone(current));
  store();
  render();
  toast({ tone: 'ok', message: text.updated(active.name) });
});

buttons.remove.addEventListener('click', () => {
  const name = active.name;
  saved = saved.filter((v) => v !== active);
  apply(builtIn[0]);
  viewSelect.setFocus(); // the button is gone with the view
  toast({ message: text.deleted(name) });
});

buttons.save.addEventListener('click', () => {
  nameInput.value = isBuiltIn(active) ? '' : active.name;
  nameInput.error = '';
  dialog.show();
});
$('.tv-cancel').addEventListener('click', () => dialog.close('cancel'));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = String(nameInput.value ?? '').trim();
  const taken = all().some((v) => v.name.toLowerCase() === name.toLowerCase());
  nameInput.error = !name ? text.nameMissing : taken ? text.nameTaken : '';
  if (nameInput.error) return;
  const view = { version: VERSION, id: `v${Date.now().toString(36)}`, name, ...structuredClone(current) };
  saved = [...saved, view];
  active = view;
  store();
  render();
  dialog.close('saved'); // the focus returns to «Save as …»
  toast({ tone: 'ok', message: text.saved(name) });
});

apply(active);
```

## The view model

A view stores keys and values, never labels or functions. Labels come from the column definitions, so a saved view follows a language change. Keep the version in every view and change it only when the format changes; `migrate` then converts old views or drops them.

```js View model
/**
 * @typedef {{
 *   version: 1,
 *   id: string,
 *   name: string,
 *   columns: { key: string, hidden?: boolean, pinned?: 'start' | 'end' }[], // kern-table columnState
 *   sort: { key: string, direction: 'asc' | 'desc' } | null,
 *   filters: { status: string[], site: string[] }, // your app's filters
 * }} TableView
 */
const offline = {
  version: 1,
  id: 'offline',
  name: 'Offline devices',
  columns: [{ key: 'name', pinned: 'start' }, { key: 'lastSeen' }, { key: 'site' }, { key: 'ip' }, { key: 'status', hidden: true }],
  sort: { key: 'lastSeen', direction: 'asc' },
  filters: { status: ['offline'], site: [] },
};
```

`columns` doesn't have to name every column. `resolveColumnState(columns, view.columns)` (exported by Kern, also used by the table) returns the complete state: unknown keys dropped, columns the view doesn't name at their place in `columns` with their default `hidden` and `pinned`, columns with `hideable: false` shown. Compare resolved states to tell whether a view was changed, as the example does.

```js Storing views on a server
// Per user on your backend instead of localStorage: the same JSON, loaded once and saved on change.
const response = await fetch('/api/me/views/devices');
const saved = response.ok ? (await response.json()).map(migrate).filter(Boolean) : [];
await fetch(`/api/me/views/devices/${view.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(view) });
```
