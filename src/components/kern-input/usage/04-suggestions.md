# Suggestions

`suggestions` offers known values while typing and still allows free text, like a native `<datalist>` but in the Kern style. It takes an array or a comma-separated string. The list shows the suggestions that contain the typed text (case-insensitive, match highlighted); Arrow keys open it and move, Enter or a click takes a suggestion, Escape and Tab close it. Taking one sets `value` and emits `kernInput` and `kernChange` like typing. Works with `type` text, search, email, url and tel.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-input label="Floor" suggestions="Ground floor, First floor, Second floor, Basement, Attic" hint="Pick a known floor or type a new one"></kern-input>
  <kern-input label="Room" size="sm" suggestions="Kitchen, Living room, Bedroom, Bathroom, Office, Garage" placeholder="e.g. Kitchen"></kern-input>
</div>
```

In Angular, bind an array: `<kern-input label="Location" [suggestions]="knownLocations" [(ngModel)]="location"></kern-input>`.
