# Relative

`relative` shows the distance to now (“3 min. ago”, “yesterday”) and updates itself; the absolute point in time is shown as tooltip. Values relative to now are set from script here.

```html
<kern-kv>
  <kern-kv-item label="Last seen"><kern-date relative data-ago="45"></kern-date></kern-kv-item>
  <kern-kv-item label="Last snapshot"><kern-date relative data-ago="5400"></kern-date></kern-kv-item>
  <kern-kv-item label="Unreachable since"><kern-date relative data-ago="93000"></kern-date></kern-kv-item>
  <kern-kv-item label="Next update check"><kern-date relative data-ago="-21600"></kern-date></kern-kv-item>
</kern-kv>
```

```js
for (const el of root.querySelectorAll('kern-date[data-ago]')) el.value = Date.now() - el.dataset.ago * 1000;
```
