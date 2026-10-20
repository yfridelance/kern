# List, limits and seconds

`list` adds a button with a list of times every `step` (here 900 s = 15 minutes). `min` and `max` limit the time. `seconds` adds a seconds segment (`HH:mm:ss`).

```html
<div style="display:grid;gap:16px;max-width:240px">
  <kern-time-picker label="Schedule" value="06:30" step="900" list min="05:00" max="23:00" locale="de-CH"></kern-time-picker>
  <kern-time-picker label="Sunrise offset" value="00:12:30" seconds locale="de-CH" size="sm"></kern-time-picker>
  <kern-time-picker label="Quiet hours" value="22:00" locale="de-CH" disabled></kern-time-picker>
</div>
```
