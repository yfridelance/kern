# kern-file-input



<!-- Auto Generated Below -->


## Overview

File picker with drop zone (firmware, configuration import), form-associated. Checks `accept` and `max-size`;
rejected files are named in the message and not added. The chosen files are listed with size and ×; with `multiple`
new files are added, otherwise they replace the previous one. The form gets the files under `name`.

## Usage

### 01-basic

# Firmware upload

A drop zone with a button. `accept` and `max-size` are checked; rejected files are named in the message and not added. A new file replaces the previous one; × removes it. The form receives the file under `name`.

```html
<div style="display:grid;gap:16px;max-width:420px">
  <kern-file-input name="firmware" label="Firmware file" accept=".zip,.bin" max-size="16MB" hint=".zip or .bin, max. 16 MB" required label-drop="or drop it here" locale="en"></kern-file-input>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-file-input').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + (e.detail.files.map((f) => `${f.name} (${f.size} B)`).join(', ') || 'none');
});
```


### 02-multiple

# Several files

With `multiple`, new files are added to the list instead of replacing it. Set `files = []` to clear the list from script.

```html
<div style="display:grid;gap:12px;max-width:420px">
  <kern-file-input label="Configuration backups" accept=".json" multiple max-size="500KB" label-drop="or drop them here"></kern-file-input>
  <kern-file-input label="Certificate" accept=".pem,.crt" disabled hint="Only with MQTT over TLS"></kern-file-input>
  <kern-button size="sm" variant="ghost" style="justify-self:start">Clear backups</kern-button>
</div>
```

```js
const input = root.querySelector('kern-file-input');
root.querySelector('kern-button').addEventListener('click', () => (input.files = []));
```



## Properties

| Property              | Attribute               | Description                                                                    | Type                            | Default     |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------ | ------------------------------- | ----------- |
| `accept`              | `accept`                | Like the native attribute: `.bin,.json`, `image/*`, `application/pdf`.         | `string \| undefined`           | `undefined` |
| `disabled`            | `disabled`              |                                                                                | `boolean`                       | `false`     |
| `error`               | `error`                 |                                                                                | `string \| undefined`           | `undefined` |
| `files`               | --                      | The chosen files; set `[]` to clear.                                           | `File[]`                        | `[]`        |
| `hint`                | `hint`                  |                                                                                | `string \| undefined`           | `undefined` |
| `label`               | `label`                 |                                                                                | `string \| undefined`           | `undefined` |
| `labelChoose`         | `label-choose`          |                                                                                | `string \| undefined`           | `undefined` |
| `labelChooseMultiple` | `label-choose-multiple` |                                                                                | `string \| undefined`           | `undefined` |
| `labelDrop`           | `label-drop`            |                                                                                | `string \| undefined`           | `undefined` |
| `labelRemove`         | `label-remove`          | `{name}` is replaced.                                                          | `string \| undefined`           | `undefined` |
| `labelTooLarge`       | `label-too-large`       | `{name}` and `{max}` are replaced.                                             | `string \| undefined`           | `undefined` |
| `labelWrongType`      | `label-wrong-type`      | `{name}` is replaced.                                                          | `string \| undefined`           | `undefined` |
| `locale`              | `locale`                | BCP 47 locale for sizes; defaults to `<html lang>`, then the browser language. | `string \| undefined`           | `undefined` |
| `maxSize`             | `max-size`              | Largest file, in bytes or as `"16MB"`, `"500KB"`.                              | `number \| string \| undefined` | `undefined` |
| `multiple`            | `multiple`              |                                                                                | `boolean`                       | `false`     |
| `name`                | `name`                  |                                                                                | `string \| undefined`           | `undefined` |
| `required`            | `required`              |                                                                                | `boolean`                       | `false`     |


## Events

| Event        | Description                       | Type                              |
| ------------ | --------------------------------- | --------------------------------- |
| `kernChange` | When files were added or removed. | `CustomEvent<{ files: File[]; }>` |


## Methods

### `addFiles(list: FileList | File[]) => Promise<void>`

Check and add files (also used for drops).

#### Parameters

| Name   | Type                 | Description |
| ------ | -------------------- | ----------- |
| `list` | `File[] \| FileList` |             |

#### Returns

Type: `Promise<void>`



### `open() => Promise<void>`

Opens the file dialog.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part         | Description   |
| ------------ | ------------- |
| `"dropzone"` | The drop zone |


----------------------------------------------


