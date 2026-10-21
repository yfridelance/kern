# Configuration

Edit a device in a side panel: open it from a list, change its name, network settings, site and cloud connection, check the input, save it on the server and report the result. The flow covers every step that can go wrong: an invalid field, a save that is still running, a server error, and success.

Kern provides `kern-drawer` with its focus handling, the form fields (`kern-input`, `kern-ip-input`, `kern-select`, `kern-switch`) with their validation messages, `kern-alert` for the server error, the busy button and `toast()`. Your app owns the device data, the rules (a free IP address, a gateway in the same network), the save request, what happens on an error and every text.

- **Validation:** native constraints on the fields (`required`, `maxlength`, the address forms of `kern-ip-input`), plus app rules shown through the field's `error`.
- **Saving:** the save button is `busy`, the fields are disabled, the panel cannot be closed, and a second click does nothing.
- **Server error:** a `kern-alert tone="danger"` at the top of the panel; all input stays as it was.
- **Success:** the panel closes, and only then the toast appears.
- **Focus:** the first field gets the focus when the panel opens; when it closes, the focus goes back to the button that opened it.

## Edit a device

Open a device with «Edit». Try an empty name, a mask like `255.0.255.0`, an IP address that another device already has (`192.168.2.21`), or a gateway outside the network. Turn on «Next save fails» to see the server error: the input stays, and the second attempt succeeds. Everything works with the keyboard: Enter in a field saves, Escape closes the panel.

```html
<kern-toolbar role="group" aria-label="Demo controls">
  <kern-switch class="cf-fail">Next save fails</kern-switch>
  <kern-switch slot="end" class="cf-de">Deutsch</kern-switch>
</kern-toolbar>
<kern-card heading="Devices" heading-level="4" class="cf-card" data-t="heading:devices">
  <kern-list class="cf-list" flush></kern-list>
</kern-card>
<kern-drawer class="cf-drawer" heading="Edit device" width="440">
  <form id="cf-device-form" class="cf-form" novalidate style="display:grid;gap:var(--space-4)">
    <kern-alert tone="danger" class="cf-error" hidden heading="Not saved" data-t="heading:notSaved"><span class="cf-error-text"></span></kern-alert>
    <kern-input name="name" label="Name" required maxlength="40" autocomplete="off" data-t="label:name"></kern-input>
    <kern-ip-input name="ip" label="IP address" allow="single" required data-t="label:ip"></kern-ip-input>
    <kern-ip-input name="mask" label="Subnet mask" allow="mask" required data-t="label:mask"></kern-ip-input>
    <kern-ip-input name="gateway" label="Gateway" allow="single" hint="Optional, in the same network" data-t="label:gateway hint:gatewayHint"></kern-ip-input>
    <kern-select name="site" label="Site" required data-t="label:site"></kern-select>
    <kern-switch name="cloud" data-t="cloud">Cloud connection</kern-switch>
  </form>
  <kern-button slot="footer" class="cf-cancel" data-t="cancel">Cancel</kern-button>
  <kern-button slot="footer" type="submit" form="cf-device-form" variant="primary" class="cf-save" data-t="save">Save</kern-button>
</kern-drawer>
```

```js
const { devices, sites, fakeServer } = await import('../assets/mock.js');
const { toast, setKernLocale, ipv4ToInt, parseMask } = await import('../kern/index.esm.js');

// ---------- texts: your app's i18n (Kern's own texts follow setKernLocale) ----------
const TEXTS = {
  en: {
    devices: 'Devices', edit: 'Edit', editDevice: (name) => `Edit ${name}`, notSaved: 'Not saved',
    name: 'Name', ip: 'IP address', mask: 'Subnet mask', gateway: 'Gateway', gatewayHint: 'Optional, in the same network',
    site: 'Site', cloud: 'Cloud connection', cancel: 'Cancel', save: 'Save',
    ipTaken: (other) => `Already used by ${other}`,
    gatewayOutside: 'Not in the network of the IP address and mask',
    saveFailed: (m) => `${m}. Your changes are still here; try again.`,
    saved: (name) => `${name} saved.`,
  },
  de: {
    devices: 'Geräte', edit: 'Bearbeiten', editDevice: (name) => `${name} bearbeiten`, notSaved: 'Nicht gespeichert',
    name: 'Name', ip: 'IP-Adresse', mask: 'Subnetzmaske', gateway: 'Gateway', gatewayHint: 'Optional, im selben Netz',
    site: 'Standort', cloud: 'Cloud-Verbindung', cancel: 'Abbrechen', save: 'Speichern',
    ipTaken: (other) => `Bereits von ${other} verwendet`,
    gatewayOutside: 'Nicht im Netz von IP-Adresse und Maske',
    saveFailed: (m) => `${m}. Deine Änderungen sind noch da; versuche es nochmals.`,
    saved: (name) => `${name} gespeichert.`,
  },
};
let lang = 'en';
const t = () => TEXTS[lang];

const $ = (s) => root.querySelector(s);
const [list, drawer, form, alert, save, cancel, failNext] = ['.cf-list', '.cf-drawer', '.cf-form', '.cf-error', '.cf-save', '.cf-cancel', '.cf-fail'].map($);
const field = (name) => form.querySelector(`[name="${name}"]`);
const fields = [...form.querySelectorAll('[name]')];

// ---------- backend: your API. The pretend server gives delay and errors; the app keeps the copy ----------
const inventory = devices.slice(0, 5).map((d) => ({ ...d, mask: '255.255.255.0', gateway: d.ip.replace(/\.\d+$/, '.1'), cloud: d.kind !== 'sensor' }));
const server = fakeServer({ rows: inventory, delay: 900 });
const api = {
  async save(id, patch) {
    await server.query({ filters: { id }, pageSize: 1 }); // stands in for PUT /devices/:id
    Object.assign(inventory.find((d) => d.id === id), patch);
  },
};

// ---------- the list with its triggers ----------
function renderList() {
  list.replaceChildren(
    ...inventory.map((d) => {
      const item = document.createElement('kern-list-item');
      const edit = Object.assign(document.createElement('kern-button'), { size: 'sm', variant: 'ghost' });
      edit.slot = 'end';
      item.dataset.id = edit.dataset.id = d.id;
      item.append(edit);
      return updateItem(item, d);
    }),
  );
}
/** Updates a row in place, so its «Edit» button (and the focus on it) stays. */
function updateItem(item, d) {
  Object.assign(item, { heading: d.name, description: `${d.ip} · ${d.site}` });
  Object.assign(item.querySelector('kern-button'), { textContent: t().edit, label: t().editDevice(d.name) });
  return item;
}

// ---------- open: fill the form, focus the first field ----------
let editing = null;
list.addEventListener('click', async (e) => {
  const button = e.target.closest('kern-button[data-id]');
  if (!button) return;
  editing = inventory.find((d) => d.id === button.dataset.id);
  form.reset(); // clears values and the «touched» state of the last visit
  for (const f of fields) f.error = undefined;
  alert.hidden = true;
  Object.assign(field('name'), { value: editing.name });
  Object.assign(field('ip'), { value: editing.ip });
  Object.assign(field('mask'), { value: editing.mask });
  Object.assign(field('gateway'), { value: editing.gateway });
  Object.assign(field('site'), { value: editing.site });
  field('cloud').checked = editing.cloud;
  drawer.heading = t().editDevice(editing.name);
  await drawer.show();
  // The panel focuses its close button first; the form starts at the first field. Workaround until #154.
  requestAnimationFrame(() => field('name').setFocus());
});

// ---------- validation: native constraints, then the app's rules as field errors ----------
function appErrors(values) {
  const errors = {};
  const other = inventory.find((d) => d.id !== editing.id && d.ip === values.ip);
  if (other) errors.ip = t().ipTaken(other.name);
  const ip = ipv4ToInt(values.ip ?? '');
  const gw = ipv4ToInt(values.gateway ?? '');
  const mask = parseMask(values.mask ?? '');
  if (values.gateway && ip !== null && gw !== null && mask && ((ip ^ gw) & ipv4ToInt(mask.mask)) >>> 0 !== 0) errors.gateway = t().gatewayOutside;
  return errors;
}
// A field error is the app's: it goes away as soon as the user changes the field.
form.addEventListener('kernInput', (e) => (e.target.error = undefined));
form.addEventListener('kernChange', (e) => (e.target.error = undefined));

// ---------- save: busy, locked, once ----------
let saving = false;
function lock(on) {
  saving = on;
  save.busy = on;
  cancel.disabled = on;
  drawer.dismissible = !on; // no Escape, backdrop or close button while the request runs
  // Disable each field, not a <fieldset>: workaround for #151.
  for (const f of fields) f.disabled = on;
}
async function submit() {
  if (saving) return; // a second click or Enter before the button re-rendered
  const data = Object.fromEntries(new FormData(form));
  const values = { name: data.name?.trim() ?? '', ip: data.ip, mask: data.mask, gateway: data.gateway ?? '', site: data.site, cloud: data.cloud === 'on' };
  const errors = appErrors(values);
  for (const f of fields) f.error = errors[f.getAttribute('name')];
  if (!form.checkValidity()) {
    // checkValidity() marks the invalid fields, so they show their message; focus the first one.
    form.querySelector(':invalid')?.setFocus();
    return;
  }
  alert.hidden = true;
  // A disabled field drops the focus (e.g. after Enter); keep it on the busy «Save» instead.
  save.focus();
  lock(true);
  try {
    if (failNext.checked) {
      server.failNext(); // demo only
      failNext.checked = false;
    }
    await api.save(editing.id, values);
    lock(false);
    drawer.close('saved');
  } catch (err) {
    lock(false);
    $('.cf-error-text').textContent = t().saveFailed(err.message);
    alert.hidden = false; // tone="danger" is announced; the focus stays on «Save»
  }
}
// «Save» sits in the footer slot, outside the form: form="cf-device-form" ties it to the form.
form.addEventListener('submit', (e) => {
  e.preventDefault();
  submit();
});
// Enter in a text field saves, as in a native form (Kern fields keep their input in the shadow DOM). Workaround until #155.
form.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.defaultPrevented && ['kern-input', 'kern-ip-input'].includes(e.target.localName)) {
    // kern-ip-input applies the typed text on the same Enter; submit once it has.
    requestAnimationFrame(() => form.requestSubmit());
  }
});
cancel.addEventListener('click', () => drawer.close('cancel'));

// ---------- close: the focus returns to «Edit», then the toast ----------
drawer.addEventListener('kernClose', (e) => {
  if (e.detail.returnValue !== 'saved') return;
  // The dialog has given the focus back to «Edit»; the row is updated in place, so it stays there.
  updateItem(list.querySelector(`kern-list-item[data-id="${editing.id}"]`), editing);
  // Toasts under an open modal are inert; now the panel is closed, so it can be read and reached.
  toast({ tone: 'ok', message: t().saved(editing.name) });
});

// ---------- texts and demo controls ----------
function renderTexts() {
  for (const node of root.querySelectorAll('[data-t]')) {
    for (const pair of node.dataset.t.split(' ')) {
      const [prop, key] = pair.includes(':') ? pair.split(':') : ['textContent', pair];
      node[prop] = t()[key];
    }
  }
  field('site').options = sites.map((s) => ({ value: s, label: s }));
  for (const item of list.children) updateItem(item, inventory.find((d) => d.id === item.dataset.id));
}
renderList();
$('.cf-de').addEventListener('kernChange', (e) => {
  lang = e.detail.checked ? 'de' : 'en';
  setKernLocale(e.detail.checked ? 'de' : undefined); // close label, address messages, select texts …
  renderTexts();
});
renderTexts();
```

## Validation

Two kinds of rules, shown the same way under the field:

- **Native constraints** sit on the fields: `required` and `maxlength` on `kern-input`, `allow="single"` and `allow="mask"` on `kern-ip-input` (a mask must be contiguous, `255.255.252.0` or `/22`), `required` on `kern-select`. The fields are form-associated, so `form.checkValidity()` checks them all and marks the invalid ones, which then show their message.
- **App rules** need knowledge only your app has: whether another device uses the address, whether the gateway lies in the network of address and mask. The app sets the field's `error`, which is also its validity message, and clears it as soon as the user changes the field. Errors the server returns per field go the same way.

After a failed check the focus moves to the first invalid field. `kern-ip-input` checks the typed text when the user leaves the field or presses Enter, so a wrong address is reported before saving. Kern's own messages («Not a valid subnet mask») follow `setKernLocale`; the messages of native constraints («Please fill out this field») come from the browser in its own language.

## Saving

While the request runs:

- **The button is `busy`**, which also ignores clicks; the handler returns early anyway (`saving`), because Enter or a fast second click can arrive before the button has re-rendered.
- **The fields are disabled**, so nothing changes under a running request, and «Cancel» is disabled. A field that gets disabled loses the focus, so the app first moves it to «Save», which stays focusable while busy.
- **The panel stays open:** `dismissible = false` blocks Escape, the backdrop and the close button until the answer is there.

The example disables each field on its own instead of a `<fieldset disabled>`, because Kern fields currently stay disabled after the fieldset is enabled again (#151). Read the values (`new FormData(form)`) before disabling: disabled fields are not part of the form data.

## Server error and success

A failed request shows a `kern-alert tone="danger"` at the top of the form. It says what went wrong and that the input is still there; the panel stays open with every value as typed, and the user saves again. A danger alert is announced by screen readers, so the focus can stay on «Save».

On success the app closes the panel with `close('saved')` and shows the toast in `kernClose`, after the panel has closed. While a modal is open, everything outside it is inert, also the toast region: a toast shown before closing could neither be reached nor read. The list then shows the new values.

## Focus and keyboard

- **Opening:** `kern-drawer` is a native modal dialog, so the focus stays inside it. It first lands on the close button in the header; the app moves it to the first field with `setFocus()` once the panel is open. `autofocus` on a Kern field does not work yet (#154).
- **Closing:** Escape, the close button, «Cancel» and «Save» all close the panel, and the dialog returns the focus to the element that had it before, the «Edit» button. So the app updates the saved row in place instead of rebuilding the list: a new button would not get the focus back.
- **Enter** in a text field saves the form. Kern fields keep their input in the shadow DOM, where the browser's implicit submission does not reach the form, so the example calls `requestSubmit()` itself (until #155).
- **Buttons in the footer** stand outside the `<form>` (they are in the panel's `footer` slot). Like a native button, `kern-button type="submit"` takes the form's id in `form`, so «Save» still submits it.

## Drawer or dialog

Use `kern-drawer` for a form with several fields, where the list behind it stays useful as context, and on small screens, where it takes nearly the full width. Use `kern-dialog` for a short form of one or two fields (rename, set a value) and for confirmations. Both have the same API (`show()`, `close(returnValue)`, `kernClose`, `dismissible`), so the script above works with either.
