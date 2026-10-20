# With a SPA router

A plain left click on kern-link emits the cancelable `kernNavigate` with `{ href, event }`; `preventDefault()` stops the page load so the app can route itself. Ctrl/Cmd click, middle click, `external`, `target="_blank"` and `download` emit nothing, so "open in new tab" keeps working.

React 19 binds `onkernNavigate` directly (older versions need `addEventListener` through a ref); Vue binds `@kernNavigate` in single-file components.

```html
<p style="margin:0">
  Open <kern-link href="#/devices/bad-lueftung">Bad Lüftung</kern-link> or
  <kern-link href="#/devices" tone="muted">all devices</kern-link>.
</p>
<p class="out" style="margin:12px 0 0;font-size:13px;color:var(--text-muted)">Click a link.</p>
```

```js
root.addEventListener('kernNavigate', (e) => {
  e.preventDefault();
  root.querySelector('.out').textContent = 'router.navigateByUrl(' + JSON.stringify(e.detail.href.slice(1)) + ')';
});
```

```ts Angular
<kern-link href="/devices/7" (kernNavigate)="$event.preventDefault(); router.navigateByUrl($event.detail.href)">Bad Lüftung</kern-link>
```

```js React
<kern-link href="/devices/7" onkernNavigate={(e) => { e.preventDefault(); navigate(e.detail.href); }}>Bad Lüftung</kern-link>
```

```html Vue
<kern-link href="/devices/7" @kernNavigate="(e) => { e.preventDefault(); router.push(e.detail.href); }">Bad Lüftung</kern-link>
```
