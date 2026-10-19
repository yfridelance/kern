# Several open sections

With `multiple` sections open independently. `flush` drops border and background, e.g. inside a kern-card. Each item emits `kernToggle` when the user opens or closes it.

```html
<kern-card heading="Advanced settings" style="max-width:480px">
  <kern-accordion multiple flush>
    <kern-accordion-item heading="Eco mode" open>Reduces power use; the relay reacts a little slower.</kern-accordion-item>
    <kern-accordion-item heading="Time server" open><kern-code inline>time.google.com</kern-code></kern-accordion-item>
    <kern-accordion-item heading="Debug log">Sends logs over WebSocket to 192.168.1.5.</kern-accordion-item>
  </kern-accordion>
  <p class="out" style="margin:8px 0 0;font-size:13px;color:var(--text-muted)">Toggle a section.</p>
</kern-card>
```

```js
root.querySelector('kern-accordion').addEventListener('kernToggle', (e) => {
  root.querySelector('.out').textContent = `${e.target.heading}: ${e.detail.open ? 'opened' : 'closed'}`;
});
```
