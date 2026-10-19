# Pick a date

An inline month view; `value` is an ISO date and `kernChange` reports `{ value }`. `show-week-numbers` adds ISO weeks (column header `label-week`), and the `footer` slot takes actions such as a “Today” button that uses `goTo()`.

```html
<kern-calendar label="Maintenance day" show-week-numbers label-week="Wk" label-prev="Previous month" label-next="Next month">
  <kern-button slot="footer" size="sm" variant="ghost">Today</kern-button>
</kern-calendar>
<pre class="out" style="font:12px var(--font-mono);color:var(--text-muted)"></pre>
```

```js
const cal = root.querySelector('kern-calendar');
const out = root.querySelector('.out');
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
root.querySelector('kern-button').addEventListener('click', () => {
  cal.value = iso(new Date());
  cal.goTo(cal.value);
});
cal.addEventListener('kernChange', (e) => (out.textContent = 'kernChange → ' + JSON.stringify(e.detail)));
```
