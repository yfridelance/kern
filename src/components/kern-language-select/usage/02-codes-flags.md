# Codes and flags

`display="code"` shows «DE», «EN»; screen readers still hear the full name. `flags` puts a flag in front: from the region of the code (`de-CH` → Switzerland), else the usual country of the language (`en` → United Kingdom). A flag names a country, not a language, so the name or code always stays next to it. When two entries share a language, the code includes the region.

```html
<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center">
  <kern-language-select value="de" languages="de,en,fr" display="code" size="sm"></kern-language-select>
  <kern-language-select value="de" languages="de,en,fr" display="code" flags size="sm"></kern-language-select>
  <kern-language-select value="de-CH" languages="de-CH,de-DE,fr-CH,it-CH" flags></kern-language-select>
</div>
```
