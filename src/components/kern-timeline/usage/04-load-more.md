# Load more and live events

With `has-more` a “Load more” button follows the last event and emits `kernLoadMore`. Set `loading` while fetching (the button turns busy), append the next events, then clear `loading` and, after the last page, `has-more`. The new events appear below the ones being read, a short status tells screen readers how many arrived, and if the button goes away, focus moves to the first new event. The app owns the cursor; Kern never sorts.

New events arrive at the top with plain DOM inserts (`prepend`, or a keyed list in a framework): focus stays where it is, and once the reader has scrolled into the history the events being read stay in place. Re-creating the whole list would lose both, so update it in place.

```html
<kern-timeline label="History of Boiler" has-more>
  <kern-timeline-item heading="Heating on" tone="ok" icon="thermometer" relative data-ago="300"></kern-timeline-item>
  <kern-timeline-item heading="Target set to 55 °C" relative data-ago="3600">
    <kern-button slot="actions" size="sm" variant="ghost">Undo</kern-button>
  </kern-timeline-item>
</kern-timeline>
<kern-toolbar style="margin-top:var(--space-4)">
  <kern-button class="live" size="sm">Simulate new event</kern-button>
</kern-toolbar>
```

```js
const timeline = root.querySelector('kern-timeline');
const item = (heading, ago, tone = 'neutral') => {
  const el = document.createElement('kern-timeline-item');
  Object.assign(el, { heading, tone, relative: true, datetime: Date.now() - ago * 1000 });
  return el;
};
for (const el of root.querySelectorAll('[data-ago]')) el.datetime = Date.now() - el.dataset.ago * 1000;

let page = 0;
timeline.addEventListener('kernLoadMore', async () => {
  timeline.loading = true;
  await new Promise((r) => setTimeout(r, 800)); // the app's request with its cursor
  page++;
  for (let i = 0; i < 3; i++) timeline.append(item(`Temperature reached ${60 - page * 3 - i} °C`, 3600 * (page * 4 + i)));
  timeline.loading = false;
  timeline.hasMore = page < 2;
});

let n = 0;
root.querySelector('.live').addEventListener('click', () => timeline.prepend(item(`Heating cycle ${++n} finished`, 0, 'ok')));
```

```ts Angular
// Keep events in a signal and render them with a keyed @for, so inserts keep focus and position.
events = signal<Event[]>([]);
async loadMore() {
  this.loading.set(true);
  const page = await this.api.history(this.deviceId, this.cursor);
  this.cursor = page.next;
  this.events.update((list) => [...list, ...page.events]);
  this.loading.set(false);
}
```
