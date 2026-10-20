# With a SPA router

The link inside kern-button lives in the shadow DOM, so `routerLink` and friends cannot catch its click. Instead, a plain left click on a button with `href` emits the cancelable `kernNavigate` with `{ href, event }`. Call `preventDefault()` to stop the page load and route yourself. Ctrl/Cmd click, middle click, `target="_blank"` and `download` emit nothing and stay with the browser, so "open in new tab" keeps working.

React 19 binds `onkernNavigate` directly (older versions need `addEventListener` through a ref); Vue binds `@kernNavigate` in single-file components.

```html
<div style="display:flex;gap:8px;flex-wrap:wrap">
  <kern-button href="#/templates/new" variant="primary">New template</kern-button>
  <kern-button href="#/templates/7/apply">Apply</kern-button>
  <kern-button href="#/templates" variant="ghost">Cancel</kern-button>
</div>
<p class="out" style="margin:12px 0 0;font-size:13px;color:var(--text-muted)">Click a button (Ctrl/Cmd click opens a new tab).</p>
```

```js
root.addEventListener('kernNavigate', (e) => {
  e.preventDefault(); // no page load, no hash change
  root.querySelector('.out').textContent = 'router.navigateByUrl(' + JSON.stringify(e.detail.href.slice(1)) + ')';
});
```

```ts Angular
<kern-button href="/templates/new" variant="primary"
  (kernNavigate)="$event.preventDefault(); router.navigateByUrl($event.detail.href)">New template</kern-button>
```

```js React
<kern-button href="/templates/new" variant="primary"
  onkernNavigate={(e) => { e.preventDefault(); navigate(e.detail.href); }}>New template</kern-button>
```

```html Vue
<kern-button href="/templates/new" variant="primary"
  @kernNavigate="(e) => { e.preventDefault(); router.push(e.detail.href); }">New template</kern-button>
```
