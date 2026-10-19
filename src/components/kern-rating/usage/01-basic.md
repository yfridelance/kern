# Star rating

A radio group with one tab stop: arrow keys change the rating, Home/End jump. With `clearable`, 0, Backspace or a click on the current star clears it (value 0 = not rated). Hovering previews.

```html
<div style="display:grid;gap:16px">
  <kern-rating name="score" label="Reliability" value="4" clearable hint="How stable does the device run?" label-value="{n} of {max} stars"></kern-rating>
  <kern-rating label="Signal" max="3" value="2" size="sm" label-value="{n} of {max}"></kern-rating>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-rating').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + e.detail.value;
});
```
