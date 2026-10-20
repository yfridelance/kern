# Switching the language

The switcher only reports the choice; the app changes its language and Kern's with `setKernLocale()` (or by setting `<html lang>`, which Kern follows). With `href`, `preventDefault()` on `kernChange` keeps the page so an app router can navigate instead; Ctrl/Cmd click on a link still opens a new tab.

```html
<kern-language-select variant="inline" value="en" languages="en,de"></kern-language-select>
<div style="margin-top:12px"><kern-pagination total="380"></kern-pagination></div>
```

```js
const { setKernLocale } = await import('../kern/index.esm.js');
root.querySelector('kern-language-select').addEventListener('kernChange', (e) => setKernLocale(e.detail.value));
```

```ts Angular
<kern-language-select [value]="lang" languages="de,en" href="/{locale}/devices" (kernChange)="onLanguage($event)"></kern-language-select>

onLanguage(e: CustomEvent<{ value: string; href?: string }>) {
  e.preventDefault(); // the router navigates instead of a page load
  this.translate.use(e.detail.value);
  setKernLocale(e.detail.value);
  this.router.navigateByUrl(e.detail.href!);
}
```
