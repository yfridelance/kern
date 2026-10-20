# Long values and English labels

Values longer than `max-value-length` (default 80) are cut with „…“; hover a cell to see the whole value. The built-in labels are German; this example sets them to English. An empty result shows `label-none`.

```html
<kern-json-diff
  max-value-length="40"
  label-before="Target"
  label-after="Actual"
  label-path="Path"
  label-kind="Kind"
  label-added="added"
  label-removed="removed"
  label-changed="changed"
  label-none="No differences"
  label-summary="{n} differences: {changed} changed, {added} added, {removed} removed"
></kern-json-diff>
<kern-json-diff
  from='{"eco_mode":true}'
  to='{"eco_mode":true}'
  label-none="No differences"
  style="margin-top: 16px"
></kern-json-diff>
```

```js
const diff = root.querySelector('kern-json-diff');
diff.from = {
  schedule: { rules: ['0800-0-1-2-3-4-on', '2200-0-1-2-3-4-off'] },
  actions: { out_on_url: ['http://192.168.1.5:8123/api/webhook/bathroom-fan-on'] },
};
diff.to = {
  schedule: { rules: ['0700-0-1-2-3-4-5-6-on', '2200-0-1-2-3-4-5-6-off'] },
  actions: { out_on_url: ['http://192.168.1.5:8123/api/webhook/bathroom-fan-on?source=shelly&channel=0'] },
};
```
