# Options with icons

`data-icon` on an `<option>` puts a kern-icon before the label, in the list and in the field (`icon` in `options`). `aria-label` gives a short label its full name for screen readers, `lang` marks its language.

```html
<kern-select label="Region" value="ch" style="max-width:260px">
  <option value="ch" data-icon="flag-ch">Switzerland</option>
  <option value="de" data-icon="flag-de">Germany</option>
  <option value="at" data-icon="flag-at">Austria</option>
</kern-select>
```
