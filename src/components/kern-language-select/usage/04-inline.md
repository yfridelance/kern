# Side by side

`variant="inline"` lists the languages next to each other, the current one bold and not clickable. Good for two or three languages, e.g. in a footer or the topbar. With `href` every language is a real link (`{locale}` is replaced), with `hreflang`; without it they are buttons.

```html
<div style="display:grid;gap:12px;justify-items:start">
  <kern-language-select variant="inline" value="de" languages="de,en"></kern-language-select>
  <kern-language-select variant="inline" value="de" languages="de,fr,it" display="code" size="sm"></kern-language-select>
  <kern-language-select variant="inline" value="en" languages="de,en,fr" flags href="#/{locale}/settings"></kern-language-select>
</div>
```
