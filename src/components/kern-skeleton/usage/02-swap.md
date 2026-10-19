# Replacing with content

Keep the skeleton the same size as the content it stands for, then swap it once the data has arrived, so the layout does not jump.

```html
<kern-card heading="Bad Lüftung" aria-busy="true" style="max-width:320px">
  <div class="body"><kern-skeleton lines="3"></kern-skeleton></div>
  <kern-button slot="footer" size="sm" class="load">Load again</kern-button>
</kern-card>
```

```js
const card = root.querySelector('kern-card');
const body = root.querySelector('.body');
const load = () => {
  card.setAttribute('aria-busy', 'true');
  body.innerHTML = '<kern-skeleton lines="3"></kern-skeleton>';
  setTimeout(() => {
    body.innerHTML = 'Plus 1PM<br>192.168.1.21<br>Firmware 1.4.4';
    card.removeAttribute('aria-busy');
  }, 1500);
};
root.querySelector('.load').addEventListener('click', load);
load();
```
