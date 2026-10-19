# Slider

Drag or click the track. Keyboard: arrow keys ± `step`, Page Up/Down ± a tenth of the range, Home/End to the limits. `marks` adds labelled ticks; the current value with `unit` is shown next to the label.

```html
<div style="display:grid;gap:24px;max-width:360px">
  <kern-range name="brightness" label="Brightness" value="60" unit="%" step="5" marks="0,25,50,75,100"></kern-range>
  <kern-range label="Volume" value="30" disabled></kern-range>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-range').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + e.detail.value;
});
```
