# Locale, required and states

With `locale="de-DE"` the field shows and accepts a decimal comma (`-0,25`). `required` blocks an empty submission; `readonly` and `disabled` stop changes.

```html
<div style="display:grid;gap:16px;max-width:280px">
  <kern-step-input label="Offset" value="-0.25" min="-5" max="5" step="0.25" unit="°C" locale="de-DE"></kern-step-input>
  <kern-step-input label="Auto-off" min="0" max="120" unit="min" required placeholder="Minutes"></kern-step-input>
  <kern-step-input label="Max. power" value="3500" unit="W" readonly></kern-step-input>
  <kern-step-input label="Brightness" value="60" unit="%" disabled></kern-step-input>
</div>
```
