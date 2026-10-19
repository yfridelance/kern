# kern-file-input



<!-- Auto Generated Below -->


## Overview

File picker with drop zone (firmware, configuration import), form-associated. Checks `accept` and `max-size`;
rejected files are named in the message and not added. The chosen files are listed with size and ×; with `multiple`
new files are added, otherwise they replace the previous one. The form gets the files under `name`.

## Properties

| Property              | Attribute               | Description                                                                    | Type                            | Default                                     |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------ | ------------------------------- | ------------------------------------------- |
| `accept`              | `accept`                | Like the native attribute: `.bin,.json`, `image/*`, `application/pdf`.         | `string \| undefined`           | `undefined`                                 |
| `disabled`            | `disabled`              |                                                                                | `boolean`                       | `false`                                     |
| `error`               | `error`                 |                                                                                | `string \| undefined`           | `undefined`                                 |
| `files`               | --                      | The chosen files; set `[]` to clear.                                           | `File[]`                        | `[]`                                        |
| `hint`                | `hint`                  |                                                                                | `string \| undefined`           | `undefined`                                 |
| `label`               | `label`                 |                                                                                | `string \| undefined`           | `undefined`                                 |
| `labelChoose`         | `label-choose`          |                                                                                | `string`                        | `'Datei wählen'`                            |
| `labelChooseMultiple` | `label-choose-multiple` |                                                                                | `string`                        | `'Dateien wählen'`                          |
| `labelDrop`           | `label-drop`            |                                                                                | `string`                        | `'oder hierher ziehen'`                     |
| `labelRemove`         | `label-remove`          | `{name}` is replaced.                                                          | `string`                        | `'{name} entfernen'`                        |
| `labelTooLarge`       | `label-too-large`       | `{name}` and `{max}` are replaced.                                             | `string`                        | `'«{name}» ist grösser als {max}.'`         |
| `labelWrongType`      | `label-wrong-type`      | `{name}` is replaced.                                                          | `string`                        | `'«{name}» hat keinen erlaubten Dateityp.'` |
| `locale`              | `locale`                | BCP 47 locale for sizes; defaults to `<html lang>`, then the browser language. | `string \| undefined`           | `undefined`                                 |
| `maxSize`             | `max-size`              | Largest file, in bytes or as `"16MB"`, `"500KB"`.                              | `number \| string \| undefined` | `undefined`                                 |
| `multiple`            | `multiple`              |                                                                                | `boolean`                       | `false`                                     |
| `name`                | `name`                  |                                                                                | `string \| undefined`           | `undefined`                                 |
| `required`            | `required`              |                                                                                | `boolean`                       | `false`                                     |


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


