# Own names and flags

Child `<option>` elements replace `languages` and may set their own name (the text) or flag (`data-flag`), e.g. for a dialect `Intl` does not name well.

```html
<kern-language-select value="gsw" flags>
  <option value="gsw" data-flag="ch">Schwiizerdütsch</option>
  <option value="de">Deutsch</option>
  <option value="en-US">English (US)</option>
</kern-language-select>
```
