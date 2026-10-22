# Server search

With `filtering="external"` the palette shows `items` as given and leaves the search to your server: load results on `kernQueryChange` (also fired with `''` when closing clears the search) and set `items`, `loading` and `error`. While loading, a spinner shows in the search field and the previous results stay; without any, «Searching …» appears. `error` replaces the results with an error state, and no results show «No results». The count is announced politely once typing and loading pause.

Answers can arrive out of order: the reply to «bo» may come after the one to «boiler». Ignoring stale answers is up to your app; the palette shows whatever you set last. Here a request counter drops every answer that is not for the latest query; an `AbortController` per query works as well and also saves the server work. Debounce `kernQueryChange` if your server needs it.

The example uses a fake server with 300–550 ms delay. «Fail next search» makes the next request fail.

```html
<div style="display:flex;flex-wrap:wrap;gap:12px">
  <kern-button class="open">
    <kern-icon name="search" slot="start"></kern-icon>
    Search devices
  </kern-button>
  <kern-button class="fail" variant="ghost">Fail next search</kern-button>
</div>
<p class="out" style="font-size:13px;color:var(--text-muted)"></p>
<kern-command-palette filtering="external" placeholder="Search devices, pages and actions …"></kern-command-palette>
```

```js
const { devices, fakeServer } = await import('../assets/mock.js');
const palette = root.querySelector('kern-command-palette');
// One searchable list on the "server": pages, 60 devices and actions.
const rows = [
  { id: 'page-devices', label: 'Devices', group: 'Pages', icon: 'home' },
  { id: 'page-updates', label: 'Updates', group: 'Pages', icon: 'download', keywords: ['firmware'] },
  ...devices.map((d) => ({
    id: d.id,
    label: d.name,
    description: `${d.model} · ${d.ip} · ${d.site}`,
    group: 'Devices',
    icon: d.kind === 'light' ? 'bulb' : d.kind === 'heating' || d.kind === 'sensor' ? 'thermometer' : 'wifi',
    keywords: [d.ip, d.mac],
    disabled: d.status === 'offline',
  })),
  { id: 'act-scan', label: 'Start network scan', group: 'Actions', icon: 'search' },
  { id: 'act-update-all', label: 'Update all devices', group: 'Actions', icon: 'download' },
];
const server = fakeServer({ rows, delay: 300, jitter: 250 });

let latest = 0;
async function search(query) {
  const ticket = ++latest;
  palette.loading = true;
  palette.error = undefined;
  try {
    const result = await server.query({ search: query, pageSize: 8 });
    if (ticket !== latest) return; // an older answer: a newer query is on its way
    palette.items = result.rows;
  } catch (err) {
    if (ticket !== latest) return;
    palette.items = [];
    palette.error = err.message;
  } finally {
    if (ticket === latest) palette.loading = false;
  }
}

palette.addEventListener('kernQueryChange', (e) => search(e.detail.query));
palette.addEventListener('kernSelect', (e) => (root.querySelector('.out').textContent = `kernSelect → ${e.detail.id}`));
root.querySelector('.open').addEventListener('click', () => palette.show());
root.querySelector('.fail').addEventListener('click', () => server.failNext());
search('');
```
