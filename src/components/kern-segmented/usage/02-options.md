# Options property

Set `options` (`{ value, label, disabled? }[]`) from script instead of child elements.

```html
<kern-segmented label="Chart period" value="24h"></kern-segmented>
```

```js
root.querySelector('kern-segmented').options = [
  { value: '1h', label: '1 h' },
  { value: '24h', label: '24 h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days', disabled: true },
];
```
