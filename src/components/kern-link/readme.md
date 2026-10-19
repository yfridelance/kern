# kern-link



<!-- Auto Generated Below -->


## Overview

Text link for running text, table cells and cards. `external` opens a new tab (with `rel="noopener noreferrer"`)
and marks the link with ↗; `tone="muted"` for secondary links; `disabled` keeps the text but removes the link.
For actions use kern-button, also when it navigates.

## Properties

| Property        | Attribute        | Description                                                            | Type                             | Default                 |
| --------------- | ---------------- | ---------------------------------------------------------------------- | -------------------------------- | ----------------------- |
| `disabled`      | `disabled`       | Shown as text, not a link.                                             | `boolean`                        | `false`                 |
| `download`      | `download`       | Download instead of navigate (optionally with this file name).         | `boolean \| string \| undefined` | `undefined`             |
| `external`      | `external`       | Opens in a new tab and shows ↗.                                        | `boolean`                        | `false`                 |
| `href`          | `href`           |                                                                        | `string \| undefined`            | `undefined`             |
| `labelExternal` | `label-external` | Read after the text of `external` links.                               | `string`                         | `'öffnet in neuem Tab'` |
| `rel`           | `rel`            | Defaults to `noopener noreferrer` for `external` or `target="_blank"`. | `string \| undefined`            | `undefined`             |
| `target`        | `target`         |                                                                        | `string \| undefined`            | `undefined`             |
| `tone`          | `tone`           | `muted` for secondary links.                                           | `"accent" \| "muted"`            | `'accent'`              |


## Slots

| Slot | Description |
| ---- | ----------- |
|      | Link text   |


## Shadow Parts

| Part     | Description     |
| -------- | --------------- |
| `"link"` | The native link |


----------------------------------------------


