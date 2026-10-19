# kern-code



<!-- Auto Generated Below -->


## Overview

Code and commands: a block with copy button, optional heading (file name), line numbers, wrapping and a maximum
height, highlighted for shell, yaml, json, js/ts and ini; or `inline` in running text. The code comes from `code`
or the text content; common indentation is removed, so it can be written indented in HTML.

## Properties

| Property      | Attribute      | Description                                    | Type                                                             | Default      |
| ------------- | -------------- | ---------------------------------------------- | ---------------------------------------------------------------- | ------------ |
| `code`        | `code`         | The code; defaults to the text content.        | `string \| undefined`                                            | `undefined`  |
| `heading`     | `heading`      | Title above the block, e.g. a file name.       | `string \| undefined`                                            | `undefined`  |
| `inline`      | `inline`       | In running text, without copy button.          | `boolean`                                                        | `false`      |
| `labelCopied` | `label-copied` |                                                | `string`                                                         | `'Kopiert'`  |
| `labelCopy`   | `label-copy`   |                                                | `string`                                                         | `'Kopieren'` |
| `language`    | `language`     |                                                | `"ini" \| "js" \| "json" \| "shell" \| "text" \| "ts" \| "yaml"` | `'text'`     |
| `lineNumbers` | `line-numbers` |                                                | `boolean`                                                        | `false`      |
| `maxHeight`   | `max-height`   | Scroll beyond this height, e.g. `240px`.       | `string \| undefined`                                            | `undefined`  |
| `noCopy`      | `no-copy`      | Hide the copy button.                          | `boolean`                                                        | `false`      |
| `wrap`        | `wrap`         | Wrap long lines instead of scrolling sideways. | `boolean`                                                        | `false`      |


## Events

| Event      | Description              | Type                              |
| ---------- | ------------------------ | --------------------------------- |
| `kernCopy` | After a successful copy. | `CustomEvent<{ value: string; }>` |


## Slots

| Slot | Description                          |
| ---- | ------------------------------------ |
|      | The code as text (instead of `code`) |


## Shadow Parts

| Part     | Description                              |
| -------- | ---------------------------------------- |
| `"code"` | The `<pre>` (block) or `<code>` (inline) |
| `"copy"` | The copy button                          |


----------------------------------------------


