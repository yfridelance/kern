# Selected tab and change event

`value` picks the initially selected panel by its `name` (the first one by default) and reflects the current choice. `kernTabChange` fires when the user switches tabs.

```html
<kern-tabs label="Log" value="warnings" style="max-width:520px">
  <kern-tab-panel name="all" label="All" count="128">All events of the last 24 hours.</kern-tab-panel>
  <kern-tab-panel name="warnings" label="Warnings" count="3">Rollladen Süd was not reachable 3 times.</kern-tab-panel>
  <kern-tab-panel name="errors" label="Errors" count="0">No errors.</kern-tab-panel>
</kern-tabs>
<p class="out" style="font-size:13px;color:var(--text-muted)">Switch a tab.</p>
```

```js
root.querySelector('kern-tabs').addEventListener('kernTabChange', (e) => {
  root.querySelector('.out').textContent = `kernTabChange → ${e.detail.value}`;
});
```
