# Kern

Dark-first Web Components für selbst gehostete Werkzeuge rund um Geräteverwaltung, Monitoring, Netzwerk und
Smarthome. Gebaut mit [Stencil](https://stenciljs.com), Shadow DOM, ohne Laufzeit-Abhängigkeiten. Light ist ein
vollwertiges zweites Theme und lässt sich umschalten.

Die Gestaltungsregeln (Farben, Typografie, Ton, wann welche Komponente) stehen im Kern-Design-System; die Tokens
dort und hier sind dieselben (`tokens/tokens.json`).

## Komponenten

| Bereich | Elemente |
| --- | --- |
| Layout | `kern-topbar`, `kern-page-header`, `kern-card`, `kern-toolbar` |
| Navigation | `kern-tabs` + `kern-tab-panel`, `kern-theme-toggle` |
| Aktionen | `kern-button` |
| Formulare | `kern-input`, `kern-textarea`, `kern-select`, `kern-switch`, `kern-checkbox`, `kern-segmented` |
| Status | `kern-badge`, `kern-status` |
| Rückmeldung | `kern-alert`, `kern-progress`, `kern-spinner`, `kern-dialog` (+ `confirm()`) |
| Daten | `kern-table`, `kern-kv` + `kern-kv-item`, `kern-stat`, `kern-sparkline`, `kern-meter`, `kern-signal`, `kern-copy`, `kern-json` |

Props, Events, Slots und Parts jeder Komponente: `src/components/<tag>/readme.md` (aus dem Code erzeugt).
Eine Demo aller Komponenten zeigt `npm start` unter http://localhost:3333.

## Einbinden

### Ohne Framework

```html
<script>try{document.documentElement.dataset.theme=localStorage.getItem('kern-theme')==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}</script>
<link rel="stylesheet" href="node_modules/@yfridelance/kern/dist/kern/kern.css">
<script type="module" src="node_modules/@yfridelance/kern/dist/kern/kern.esm.js"></script>
```

`kern.css` bringt die Tokens (CSS-Variablen), das Theme und die Grundstile; es wird **einmal pro Seite** geladen.
Die Elemente laden sich danach selbst (Lazy Loading pro Komponente).

### Mit Bundler / Angular

```ts
import { defineCustomElements } from '@yfridelance/kern/loader';
import { initTheme } from '@yfridelance/kern';

initTheme();             // gespeichertes Theme, sonst dark
defineCustomElements();  // registriert alle kern-*-Elemente
```

`kern.css` in die globalen Styles aufnehmen (Angular: `angular.json` → `styles`). Für Angular erzeugt der Build
zusätzlich Standalone-Wrapper mit `ControlValueAccessor` für `ngModel` und Reactive Forms
(`angular/src/directives/`); ohne Wrapper reicht `CUSTOM_ELEMENTS_SCHEMA` und Property-Binding
(`[data]="config()"`, `(kernChange)="…"`).

## Themes

- `dark` ist Standard, `light` überschreibt nur Farben und Schatten. Das Theme hängt als `data-theme` an `<html>`.
- `setTheme('light')`, `getTheme()`, `initTheme({ default: 'dark' | 'light' | 'system' })`; gespeichert unter
  `localStorage['kern-theme']`, Event `kernThemeChange` auf `document`.
- `<kern-theme-toggle>` schaltet um; Aria-Labels per `label-light` / `label-dark` übersetzbar.

## Wichtige Verhaltensregeln

- **Formulare:** `kern-input`, `kern-textarea`, `kern-select`, `kern-switch`, `kern-checkbox` und `kern-segmented`
  sind formularfähig (ElementInternals): `name`, `FormData`, `form.reset()` und `required` funktionieren wie bei
  nativen Feldern. `kern-button type="submit"` sendet das umgebende Formular. Ein Feld mit `error` gilt als ungültig
  und **blockiert das Absenden**, bis der Fehler entfernt ist.
- **Optionen** für `kern-select` und `kern-segmented` kommen aus der Property `options` oder aus Kind-`<option>`;
  Änderungen an den Kindern werden übernommen (`@for` funktioniert).
- **Tabellen:** `kern-table` umschliesst eine native `<table>` ohne Shadow DOM, damit Zellen beliebiges Markup und
  Framework-Bindings enthalten können. Zellklassen `mono`, `num`, `empty`; Zeilen `clickable`, `dim`,
  `aria-selected="true"`; sortierbar mit `<th aria-sort><button>`.
- **Bestätigen:** `await confirm({ heading, message, confirmLabel, danger, typeToConfirm })` öffnet einen
  `kern-dialog`. Mit `typeToConfirm` (z.B. die MAC) bleibt die Bestätigung gesperrt, bis der Wert eingetippt ist.
- **Theming von aussen:** nur über Tokens (CSS-Variablen) und die dokumentierten `::part()`; keine Farben in Apps
  erfinden.
- **Texte:** Standardtexte (Aria-Labels, «Abbrechen») sind deutsch und über Props übersetzbar.

## Entwicklung

```bash
npm install
npm start        # Demo mit Watch unter http://localhost:3333
npm test         # Spec-Tests (Jest)
npm run build    # dist/, loader/, www/, Angular-Wrapper, readme.md pro Komponente
```

- Node 24 (`.nvmrc`), Stencil 4.45.
- Tokens nur in `tokens/tokens.json` ändern; `npm run tokens` (läuft bei build/test/start mit) erzeugt
  `src/global/tokens.css`.
- Komponenten-Styles nutzen ausschliesslich Tokens (`var(--surface)`, `var(--space-4)` …).
- Neue Komponente: `npm run generate`, Doku-Kommentar über der Klasse (erster Satz = Zusammenfassung), Props mit
  JSDoc, Spec-Test für Logik.

## Lizenz

MIT
