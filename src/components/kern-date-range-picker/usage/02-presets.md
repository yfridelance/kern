# Presets and limits

Elements in the `presets` slot set the range on click: `data-range` is an ISO 8601 duration ending today (`P7D` = the last 7 days incl. today), or use `data-start`/`data-end`. `max-days` limits the length; `max` is set to today here so no future days can be picked.

```html
<div style="max-width:360px">
  <kern-date-range-picker label="Energy statistics" max-days="90" hint="At most 90 days" locale="en-GB" label-too-long="At most {n} days" label-incomplete="Enter a start and an end">
    <kern-button slot="presets" variant="ghost" size="sm" data-range="P1D">Today</kern-button>
    <kern-button slot="presets" variant="ghost" size="sm" data-range="P7D">Last 7 days</kern-button>
    <kern-button slot="presets" variant="ghost" size="sm" data-range="P30D">Last 30 days</kern-button>
    <kern-button slot="presets" variant="ghost" size="sm" data-start="2026-01-01" data-end="2026-03-31">Q1 2026</kern-button>
  </kern-date-range-picker>
</div>
```

```js
const d = new Date();
root.querySelector('kern-date-range-picker').max = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
```
