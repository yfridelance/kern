# kern-ip-input



<!-- Auto Generated Below -->


## Overview

IPv4 field for a single address (`192.168.1.10`), a range (`192.168.1.10-192.168.1.50`, also `192.168.1.10-50`)
or a CIDR block (`192.168.1.0/24`), form-associated. Typed text is applied on Enter or when leaving the field and
normalised; `value` and the form value are the normalised form. Ranges and blocks show their size in the field.

## Properties

| Property          | Attribute           | Description                                                                                      | Type                  | Default                               |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------- |
| `allow`           | `allow`             | Allowed forms, space-separated: `single`, `range`, `cidr`.                                       | `string`              | `'single range cidr'`                 |
| `ariaLabelText`   | `aria-label-text`   | Accessible name when there is no visible label.                                                  | `string \| undefined` | `undefined`                           |
| `disabled`        | `disabled`          |                                                                                                  | `boolean`             | `false`                               |
| `error`           | `error`             |                                                                                                  | `string \| undefined` | `undefined`                           |
| `hideCount`       | `hide-count`        | Hide the number of addresses in the field.                                                       | `boolean`             | `false`                               |
| `hint`            | `hint`              |                                                                                                  | `string \| undefined` | `undefined`                           |
| `label`           | `label`             |                                                                                                  | `string \| undefined` | `undefined`                           |
| `labelCount`      | `label-count`       | Size of a range or block; `{n}` is replaced by the number.                                       | `string`              | `'{n} Adressen'`                      |
| `labelInvalid`    | `label-invalid`     | Shown for text that is no IPv4 address, range or CIDR block.                                     | `string`              | `'Keine gültige IPv4-Adresse'`        |
| `labelNotAllowed` | `label-not-allowed` | Shown for a form excluded by `allow`.                                                            | `string`              | `'Diese Form ist hier nicht erlaubt'` |
| `labelTooMany`    | `label-too-many`    | Shown above `max-addresses`; `{n}` is replaced by it.                                            | `string`              | `'Höchstens {n} Adressen'`            |
| `locale`          | `locale`            | BCP 47 locale for the number of addresses; defaults to `<html lang>`, then the browser language. | `string \| undefined` | `undefined`                           |
| `maxAddresses`    | `max-addresses`     | Largest allowed number of addresses.                                                             | `number \| undefined` | `undefined`                           |
| `name`            | `name`              |                                                                                                  | `string \| undefined` | `undefined`                           |
| `placeholder`     | `placeholder`       | Defaults to an example of the first allowed form.                                                | `string \| undefined` | `undefined`                           |
| `readonly`        | `readonly`          |                                                                                                  | `boolean`             | `false`                               |
| `required`        | `required`          |                                                                                                  | `boolean`             | `false`                               |
| `size`            | `size`              |                                                                                                  | `"md" \| "sm"`        | `'md'`                                |
| `value`           | `value`             | Normalised address, range or CIDR block; empty when none.                                        | `string`              | `''`                                  |


## Events

| Event        | Description                                                                                     | Type                                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kernChange` | When typed text is applied: the normalised value and what it covers (empty value when cleared). | `CustomEvent<{ value: string; kind?: KernIpKind \| undefined; first?: string \| undefined; last?: string \| undefined; count?: number \| undefined; }>` |
| `kernInput`  | On every keystroke, with the raw text.                                                          | `CustomEvent<{ value: string; }>`                                                                                                                       |


## Methods

### `setFocus() => Promise<void>`

Focuses the native input.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"control"` |             |


----------------------------------------------


