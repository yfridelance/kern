# Day groups

`group-by="day"` puts a day heading above the first event of each day: “Today”, “Yesterday”, then the full date, in the page language. Times then show without the date. Without `relative` the item shows the time of day; the heading updates at midnight.

```html
<kern-timeline group-by="day" label="Events of Shutter south">
  <kern-timeline-item heading="Moved to 40 %" data-ago="1800"></kern-timeline-item>
  <kern-timeline-item heading="Calibration finished" tone="ok" data-ago="7200"></kern-timeline-item>
  <kern-timeline-item heading="Motor overheated" tone="danger" status="Stopped" data-ago="90000">
    Stopped for 15 minutes to cool down.
  </kern-timeline-item>
  <kern-timeline-item heading="Moved to 100 %" data-ago="95000"></kern-timeline-item>
  <kern-timeline-item heading="Schedule changed" icon="calendar" data-ago="280000">
    Closes at sunset instead of 21:00.
  </kern-timeline-item>
</kern-timeline>
```

```js
for (const el of root.querySelectorAll('[data-ago]')) el.datetime = Date.now() - el.dataset.ago * 1000;
```
