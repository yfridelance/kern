# kern-accordion-item



<!-- Auto Generated Below -->


## Overview

One collapsible section of kern-accordion, on the native `<details>`/`<summary>` (Enter/Space toggle, announced as
expanded/collapsed).

## Properties

| Property   | Attribute  | Description        | Type                  | Default     |
| ---------- | ---------- | ------------------ | --------------------- | ----------- |
| `disabled` | `disabled` | Cannot be toggled. | `boolean`             | `false`     |
| `heading`  | `heading`  |                    | `string \| undefined` | `undefined` |
| `open`     | `open`     |                    | `boolean`             | `false`     |


## Events

| Event        | Description                           | Type                              |
| ------------ | ------------------------------------- | --------------------------------- |
| `kernToggle` | After opening or closing by the user. | `CustomEvent<{ open: boolean; }>` |


## Slots

| Slot        | Description                                                    |
| ----------- | -------------------------------------------------------------- |
|             | Content                                                        |
| `"heading"` | Heading content (instead of `heading`), e.g. with a kern-badge |


## Shadow Parts

| Part        | Description               |
| ----------- | ------------------------- |
| `"content"` | The content area          |
| `"summary"` | The clickable heading row |


----------------------------------------------


