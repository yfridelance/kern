# kern-ip-input



<!-- Auto Generated Below -->


## Overview

IPv4 field for a single address (`192.168.1.10`), a range (`192.168.1.10-192.168.1.50`, also `192.168.1.10-50`),
a CIDR block (`192.168.1.0/24`) or a subnet mask (`255.255.255.0`, also `/24`), form-associated. Typed text is applied on Enter or when leaving the field and
normalised; `value` and the form value are the normalised form. Ranges, blocks and masks show their size in the field.

## Usage

### 01-basic

# Address, range or CIDR

One field accepts a single address, a range (`192.168.1.10-50`) or a CIDR block. Typed text is applied and normalised on Enter or when leaving the field; ranges and blocks show their size. `max-addresses` limits the size, `locale` formats the count.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-ip-input label="Scan range" value="192.168.1.0/24" max-addresses="1024" hint="Address, range or CIDR, max. 1024 addresses" label-count="{n} addresses" label-too-many="At most {n} addresses" label-invalid="Not a valid IPv4 address" locale="en"></kern-ip-input>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelector('kern-ip-input').addEventListener('kernChange', (e) => {
  root.querySelector('output').textContent = 'kernChange → ' + JSON.stringify(e.detail);
});
```


### 02-single

# Single address only

`allow="single"` accepts only one address (also `range`, `cidr` or a space-separated combination); other forms show `label-not-allowed`. Also shown: `required`, `readonly`, `disabled` and `size="sm"`.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-ip-input label="Gateway" allow="single" value="192.168.1.1" required label-not-allowed="Only a single address is allowed here"></kern-ip-input>
  <kern-ip-input label="Device IP" allow="single" value="192.168.1.21" readonly></kern-ip-input>
  <kern-ip-input label="DNS" allow="single" value="192.168.1.2" disabled size="sm"></kern-ip-input>
</div>
```


### 03-mask

# Subnet mask

`allow="mask"` accepts only contiguous subnet masks; `255.0.255.0` or an address like `192.168.1.1` shows `label-invalid-mask`. A prefix (`/22` or `22`) is normalised to the dotted mask, or the other way round with `mask-format="prefix"`. The field shows the prefix and the number of usable hosts (`label-mask-count`); `kernChange` reports `kind: 'mask'`, `mask`, `prefix` and `hosts`. With `allow="single mask"`, a valid mask counts as mask and anything else as address.

```html
<div style="display:grid;gap:16px;max-width:360px">
  <kern-ip-input label="Netmask" allow="mask" value="255.255.255.0" required hint="Dotted mask or prefix, e.g. /22" label-invalid-mask="Not a valid subnet mask" label-mask-count="/{prefix} · {n} hosts" locale="en"></kern-ip-input>
  <kern-ip-input label="Prefix" allow="mask" mask-format="prefix" value="/16" label-invalid-mask="Not a valid subnet mask" label-mask-count="/{prefix} · {n} hosts" locale="en"></kern-ip-input>
  <output style="font:12px var(--font-mono);color:var(--text-muted)">kernChange → …</output>
</div>
```

```js
root.querySelectorAll('kern-ip-input').forEach((el) =>
  el.addEventListener('kernChange', (e) => {
    root.querySelector('output').textContent = 'kernChange → ' + JSON.stringify(e.detail);
  }),
);
```



## Properties

| Property           | Attribute            | Description                                                                                                                                                                                                                                    | Type                   | Default                               |
| ------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------- |
| `allow`            | `allow`              | Allowed forms, space-separated: `single`, `range`, `cidr`, `mask`. `mask` accepts only contiguous subnet masks (`255.255.252.0`) and prefixes (`/22`, `22`); combined with `single`, a valid mask counts as mask and anything else as address. | `string`               | `'single range cidr'`                 |
| `ariaLabelText`    | `aria-label-text`    | Accessible name when there is no visible label.                                                                                                                                                                                                | `string \| undefined`  | `undefined`                           |
| `disabled`         | `disabled`           |                                                                                                                                                                                                                                                | `boolean`              | `false`                               |
| `error`            | `error`              |                                                                                                                                                                                                                                                | `string \| undefined`  | `undefined`                           |
| `hideCount`        | `hide-count`         | Hide the number of addresses in the field.                                                                                                                                                                                                     | `boolean`              | `false`                               |
| `hint`             | `hint`               |                                                                                                                                                                                                                                                | `string \| undefined`  | `undefined`                           |
| `label`            | `label`              |                                                                                                                                                                                                                                                | `string \| undefined`  | `undefined`                           |
| `labelCount`       | `label-count`        | Size of a range or block; `{n}` is replaced by the number.                                                                                                                                                                                     | `string`               | `'{n} Adressen'`                      |
| `labelInvalid`     | `label-invalid`      | Shown for text that is no IPv4 address, range or CIDR block.                                                                                                                                                                                   | `string`               | `'Keine gültige IPv4-Adresse'`        |
| `labelInvalidMask` | `label-invalid-mask` | Shown for text that is no subnet mask when only `mask` is allowed.                                                                                                                                                                             | `string`               | `'Keine gültige Subnetzmaske'`        |
| `labelMaskCount`   | `label-mask-count`   | Size of a mask; `{prefix}` is replaced by the prefix length, `{n}` by the number of hosts.                                                                                                                                                     | `string`               | `'/{prefix} · {n} Hosts'`             |
| `labelNotAllowed`  | `label-not-allowed`  | Shown for a form excluded by `allow`.                                                                                                                                                                                                          | `string`               | `'Diese Form ist hier nicht erlaubt'` |
| `labelTooMany`     | `label-too-many`     | Shown above `max-addresses`; `{n}` is replaced by it.                                                                                                                                                                                          | `string`               | `'Höchstens {n} Adressen'`            |
| `locale`           | `locale`             | BCP 47 locale for the number of addresses; defaults to `<html lang>`, then the browser language.                                                                                                                                               | `string \| undefined`  | `undefined`                           |
| `maskFormat`       | `mask-format`        | How a mask is normalised: `dotted` (`255.255.255.0`) or `prefix` (`/24`).                                                                                                                                                                      | `"dotted" \| "prefix"` | `'dotted'`                            |
| `maxAddresses`     | `max-addresses`      | Largest allowed number of addresses.                                                                                                                                                                                                           | `number \| undefined`  | `undefined`                           |
| `name`             | `name`               |                                                                                                                                                                                                                                                | `string \| undefined`  | `undefined`                           |
| `placeholder`      | `placeholder`        | Defaults to an example of the first allowed form.                                                                                                                                                                                              | `string \| undefined`  | `undefined`                           |
| `readonly`         | `readonly`           |                                                                                                                                                                                                                                                | `boolean`              | `false`                               |
| `required`         | `required`           |                                                                                                                                                                                                                                                | `boolean`              | `false`                               |
| `size`             | `size`               |                                                                                                                                                                                                                                                | `"md" \| "sm"`         | `'md'`                                |
| `value`            | `value`              | Normalised address, range, CIDR block or mask; empty when none.                                                                                                                                                                                | `string`               | `''`                                  |


## Events

| Event        | Description                                                                                     | Type                                                                                                                                                                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kernChange` | When typed text is applied: the normalised value and what it covers (empty value when cleared). | `CustomEvent<{ value: string; kind?: "mask" \| KernIpKind \| undefined; first?: string \| undefined; last?: string \| undefined; count?: number \| undefined; mask?: string \| undefined; prefix?: number \| undefined; hosts?: number \| undefined; }>` |
| `kernInput`  | On every keystroke, with the raw text.                                                          | `CustomEvent<{ value: string; }>`                                                                                                                                                                                                                        |


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


