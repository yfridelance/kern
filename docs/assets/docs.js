// Documentation site: navigation filter, mobile drawer, highlight of the current page.
const filter = (query) => {
  const q = query.trim().toLowerCase();
  for (const navEl of document.querySelectorAll('nav[aria-label="Documentation"]')) {
    for (const group of navEl.querySelectorAll('.nav-group')) {
      let visible = 0;
      for (const a of group.querySelectorAll('a')) {
        const hit = !q || a.textContent.toLowerCase().includes(q);
        a.hidden = !hit;
        if (hit) visible++;
      }
      group.hidden = visible === 0;
    }
  }
};

const search = document.querySelector('.search');
search?.addEventListener('kernInput', (e) => filter(e.detail.value));
search?.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const first = document.querySelector('.sidebar a:not([hidden])');
  if (first) location.href = first.href;
});
document.addEventListener('keydown', (e) => {
  // "/" focuses the search like on GitHub.
  if (e.key === '/' && !e.target.closest?.('input, textarea, [contenteditable]') && document.activeElement?.localName !== 'kern-input') {
    e.preventDefault();
    search?.setFocus?.();
  }
});

const drawer = document.querySelector('.nav-drawer');
document.querySelector('.menu-button')?.addEventListener('click', () => drawer?.show());

document.querySelector('.sidebar a[aria-current="page"]')?.scrollIntoView({ block: 'center' });
