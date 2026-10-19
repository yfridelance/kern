# Pick a range

With `range` the first pick sets `start`, the second `end`, and `kernChange` reports `{ start, end }`. `months="2"` shows two months side by side; `max-days` locks days farther than that from `start`.

```html
<kern-calendar range months="2" max-days="14" label="Evaluation period" label-prev="Previous month" label-next="Next month"></kern-calendar>
<pre class="out" style="font:12px var(--font-mono);color:var(--text-muted)"></pre>
```

```js
const out = root.querySelector('.out');
root.querySelector('kern-calendar').addEventListener('kernChange', (e) => (out.textContent = 'kernChange → ' + JSON.stringify(e.detail)));
```
