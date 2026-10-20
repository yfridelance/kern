# Dropdown

`languages` lists the codes; each language is shown by its own name («Deutsch», «Français»), marked with `lang`, so screen readers pronounce it correctly. `kernChange` reports `{ value }`.

```html
<kern-language-select value="de" languages="de,en,fr,it"></kern-language-select>
<p class="out" style="margin:12px 0 0;font-size:13px;color:var(--text-muted)">Choose a language.</p>
```

```js
root.addEventListener('kernChange', (e) => {
  root.querySelector('.out').textContent = 'kernChange → ' + JSON.stringify(e.detail);
});
```
