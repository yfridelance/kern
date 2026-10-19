# Keyboard

Each heading is a native `<summary>`: Tab moves between headings, Enter or Space toggles the section, and screen readers announce it as expanded or collapsed. Disabled sections are skipped.

```html
<kern-accordion style="max-width:480px">
  <kern-accordion-item heading="Input 1 – Push button">Toggles «Bad Lüftung».</kern-accordion-item>
  <kern-accordion-item heading="Input 2 – Switch">Toggles «Küche Licht».</kern-accordion-item>
  <kern-accordion-item heading="Input 3 – Detached" disabled>No action.</kern-accordion-item>
  <kern-accordion-item heading="Input 4 – Push button">Opens «Rollladen Süd».</kern-accordion-item>
</kern-accordion>
```
