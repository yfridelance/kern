# Limits and disabled days

`min` and `max` bound the selectable dates; `isDateDisabled` is a property taking a function from ISO date to boolean, e.g. to block weekends. Here only workdays in the last three months can be picked.

```html
<kern-calendar label="Report day"></kern-calendar>
```

```js
const cal = root.querySelector('kern-calendar');
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const today = new Date();
cal.min = iso(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()));
cal.max = iso(today);
cal.isDateDisabled = (d) => [0, 6].includes(new Date(d + 'T00:00').getDay());
```
