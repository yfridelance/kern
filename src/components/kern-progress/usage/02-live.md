# Updating the value

Set `value` and `valueText` as the operation advances.

```html
<div style="display:grid;gap:12px;max-width:480px">
  <kern-progress label="Scan 192.168.1.0/24" value="0" max="254" value-text="0 / 254"></kern-progress>
  <kern-button class="start" size="sm" style="justify-self:start">Start scan</kern-button>
</div>
```

```js
const bar = root.querySelector('kern-progress');
root.querySelector('.start').addEventListener('click', () => {
  let n = 0;
  const id = setInterval(() => {
    n = Math.min(254, n + 17);
    bar.value = n;
    bar.valueText = `${n} / 254`;
    if (n === 254) clearInterval(id);
  }, 200);
});
```
