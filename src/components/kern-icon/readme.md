# kern-icon



<!-- Auto Generated Below -->


## Overview

One of Kern's glyphs (Lucide style). Sized by `font-size` (1em) and coloured by `currentColor`, so it fits text and
buttons. Decorative without `label`; with `label` it is announced as an image. Names: see the README.

## Usage

### 01-basic

# Glyphs

`name` picks one of Kern's glyphs (the full list is exported as `ICON_NAMES`). Icons are sized by `font-size` and coloured with `currentColor`, so they follow the surrounding text. Without `label` an icon is decorative and hidden from screen readers.

```html
<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;font-size:20px">
  <kern-icon name="wifi"></kern-icon>
  <kern-icon name="power"></kern-icon>
  <kern-icon name="refresh"></kern-icon>
  <kern-icon name="bulb" style="color:var(--warn)"></kern-icon>
  <kern-icon name="thermometer"></kern-icon>
  <kern-icon name="settings" style="font-size:28px"></kern-icon>
</div>
```


### 02-accessible

# Meaningful icons

When an icon carries information on its own, give it a `label`; it is then announced as an image. In buttons the icon stays decorative and the button gets the name instead.

```html
<p style="margin:0;display:flex;gap:12px;align-items:center">
  Bad Lüftung <kern-icon name="lock" label="Password protected"></kern-icon>
  <kern-button size="sm" variant="ghost" icon-only label="Restart"><kern-icon name="power"></kern-icon></kern-button>
</p>
```



## Properties

| Property            | Attribute | Description                                         | Type                                                                                                                                                                                                                                                                                                                                                                                                                                         | Default     |
| ------------------- | --------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `label`             | `label`   | Accessible name; without it the icon is decorative. | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                        | `undefined` |
| `name` _(required)_ | `name`    | Glyph name, e.g. `wifi`, `power`, `refresh`.        | `"bulb" \| "calendar" \| "check" \| "chevron-down" \| "chevron-left" \| "chevron-right" \| "chevron-up" \| "clock" \| "close" \| "copy" \| "download" \| "edit" \| "external" \| "eye" \| "eye-off" \| "filter" \| "home" \| "info" \| "link" \| "lock" \| "menu" \| "minus" \| "moon" \| "more" \| "plus" \| "power" \| "refresh" \| "search" \| "settings" \| "star" \| "sun" \| "thermometer" \| "trash" \| "upload" \| "warn" \| "wifi"` | `undefined` |


----------------------------------------------


