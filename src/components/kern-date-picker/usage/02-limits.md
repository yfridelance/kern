# Limits, disabled days and footer

`min` and `max` limit the range; the `isDateDisabled` property adds a rule, here no weekends. Dates outside show `label-out-of-range`. Buttons in the `footer` slot appear below the calendar; clicking one closes it.

```html
<div style="max-width:280px">
  <kern-date-picker name="due" label="Maintenance on" required hint="Weekdays only" min="2026-10-01" max="2026-12-31" show-week-numbers locale="en-GB" label-out-of-range="Date not allowed">
    <kern-button slot="footer" size="sm" variant="ghost">Today</kern-button>
  </kern-date-picker>
</div>
```

```js
const picker = root.querySelector('kern-date-picker');
picker.isDateDisabled = (iso) => [0, 6].includes(new Date(iso + 'T00:00').getDay());
root.querySelector('kern-button').addEventListener('click', () => {
  const d = new Date();
  picker.value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
});
```
