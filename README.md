# Kern

Dark-first Web Components für selbst gehostete Werkzeuge rund um Geräteverwaltung, Monitoring, Netzwerk und
Smarthome. Gebaut mit [Stencil](https://stenciljs.com), Shadow DOM, ohne Laufzeit-Abhängigkeiten. Light ist ein
vollwertiges zweites Theme und lässt sich umschalten.

**Dokumentation:** https://yfridelance.github.io/kern/ – eine Seite pro Komponente mit Beispielen, Properties,
Events und Methoden, dazu «Getting started» und «Fundamentals» (englisch).

## Installation

```bash
npm install @yfridelance/kern
```

Ohne Build direkt vom CDN: `https://unpkg.com/@yfridelance/kern/dist/kern/kern.css` und
`https://unpkg.com/@yfridelance/kern/dist/kern/kern.esm.js` (Details unter «Getting started» in der Dokumentation).

Die Gestaltungsregeln (Farben, Typografie, Ton, wann welche Komponente) stehen im Kern-Design-System; die Tokens
dort und hier sind dieselben (`tokens/tokens.json`).

## Komponenten

| Bereich | Elemente |
| --- | --- |
| Layout | `kern-app-shell`, `kern-topbar`, `kern-page-header`, `kern-grid` + `kern-grid-item`, `kern-card`, `kern-toolbar`, `kern-accordion` + `kern-accordion-item` |
| Navigation | `kern-tabs` + `kern-tab-panel`, `kern-link`, `kern-breadcrumb`, `kern-pagination`, `kern-language-select`, `kern-theme-toggle` |
| Aktionen | `kern-button`, `kern-menu` + `kern-menu-item` |
| Formulare | `kern-input`, `kern-ip-input`, `kern-mac-input`, `kern-file-input`, `kern-textarea`, `kern-select`, `kern-switch`, `kern-checkbox`, `kern-radio-group` + `kern-radio`, `kern-segmented`, `kern-date-picker`, `kern-date-range-picker`, `kern-time-picker`, `kern-color-picker`, `kern-step-input`, `kern-range`, `kern-rating` |
| Status | `kern-badge`, `kern-chip`, `kern-status`, `kern-icon` |
| Rückmeldung | `kern-alert`, `kern-empty-state`, `kern-skeleton`, `kern-toast` (+ `toast()`), `kern-tooltip`, `kern-drawer`, `kern-progress`, `kern-spinner`, `kern-dialog` (+ `confirm()`) |
| Daten | `kern-table`, `kern-table-columns`, `kern-list` + `kern-list-item`, `kern-kv` + `kern-kv-item`, `kern-stat`, `kern-sparkline`, `kern-meter`, `kern-signal`, `kern-copy`, `kern-json`, `kern-json-diff` (+ `diffJson()`), `kern-code`, `kern-log` |
| Datum & Zeit | `kern-date`, `kern-time`, `kern-calendar` |

Props, Events, Slots und Parts jeder Komponente: `src/components/<tag>/readme.md` (aus dem Code erzeugt).

### Benennung

Jede Komponente hat einen eigenen Tag (kein `kern-input type="…"`), weil Werte, Events, Props und Popover je Typ
verschieden sind. Der Name sagt die Rolle:

| Rolle | Name | Beispiele |
| --- | --- | --- |
| Anzeige | Nomen | `kern-date`, `kern-time`, `kern-status`, `kern-meter`, `kern-list`, `kern-link`, `kern-icon`, `kern-tooltip`, `kern-toast`, `kern-pagination`, `kern-breadcrumb`, `kern-skeleton`, `kern-code` |
| Bedienelement ohne Feldbox | Nomen | `kern-switch`, `kern-checkbox`, `kern-segmented`, `kern-radio-group`, `kern-calendar`, `kern-rating`, `kern-range`, `kern-tabs`, `kern-menu`, `kern-drawer`, `kern-accordion` |
| Tippfeld mit eigenem Wertmodell | `-input` | `kern-ip-input`, `kern-mac-input`, `kern-file-input`, `kern-step-input` |
| Feld, das ein Auswahl-Popover anbietet | `-picker` | `kern-date-picker`, `kern-date-range-picker`, `kern-time-picker`, `kern-color-picker` |

Native Gegenstücke behalten ihren Namen: `kern-input` (allgemeines Tippfeld), `kern-textarea`, `kern-select`. So
können Anzeige und Eingabe nebeneinander bestehen (`kern-date` / `kern-date-picker`, später `kern-ip` /
`kern-ip-input`).
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

- **Formulare:** `kern-input`, `kern-ip-input`, `kern-mac-input`, `kern-file-input`, `kern-textarea`, `kern-select`,
  `kern-switch`, `kern-checkbox`, `kern-segmented`, `kern-date-picker`, `kern-date-range-picker`,
  `kern-time-picker`, `kern-color-picker`, `kern-step-input` und `kern-rating` sind formularfähig
  (ElementInternals): `name`, `FormData`, `form.reset()` und `required` funktionieren wie bei nativen Feldern.
  `kern-button type="submit"` sendet das umgebende Formular, ebenso Enter in einem einzeiligen Feld (abschaltbar mit
  `no-implicit-submit`). Ein Feld mit `error` gilt als ungültig und **blockiert das Absenden**, bis der Fehler
  entfernt ist.
- **IPv4:** `kern-ip-input` nimmt eine Adresse (`192.168.1.10`), einen Bereich (`192.168.1.10-192.168.1.50`, auch
  `192.168.1.10-50`) oder CIDR (`192.168.1.0/24`) und normalisiert beim Verlassen (Host-Adresse in CIDR → Netz,
  umgekehrter Bereich → getauscht). `allow="single range cidr"` und `max-addresses` begrenzen; Bereiche zeigen ihre
  Grösse im Feld. `kernChange` liefert `{ value, kind, first, last, count }`. `parseIpv4()`, `ipv4ToInt()` und
  `intToIpv4()` sind exportiert. `allow="mask"` nimmt nur zusammenhängende Subnetzmasken (`255.255.252.0`, auch `/22`)
  und zeigt `/22 · 1022 Hosts`; `parseMask()` prüft dasselbe in der App.
- **MAC-Adressen:** `kern-mac-input` akzeptiert `C82B961A3F00`, `c8:2b:…`, `c8-2b-…` und `c82b.961a.3f00` und
  normalisiert auf `format="colon|dash|dot|plain"` und `letter-case="upper|lower"`. `parseMac()`/`formatMac()` sind
  exportiert.
- **Dateien:** `kern-file-input` mit Ablagefläche und «Datei wählen»; `accept` (wie nativ) und `max-size` (Bytes oder
  `"16MB"`) prüfen, abgelehnte Dateien werden genannt und nicht übernommen. `multiple` fügt hinzu, sonst ersetzt eine
  neue Datei die alte. Liste mit Grösse und ×, `kernChange` mit `{ files }`, das Formular bekommt die Dateien. Kein
  Angular-Value-Accessor: `(kernChange)` verwenden.
- **Vorschläge:** `kern-input` mit `suggestions` (Array oder kommagetrennt) zeigt beim Tippen passende Werte in einer
  eigenen Liste (enthält, ohne Gross/Klein); freie Eingabe bleibt erlaubt. Pfeile/Enter/Klick übernehmen, Escape und Tab
  schliessen; die Übernahme feuert `kernInput` und `kernChange` wie Tippen. Nur bei `type` text/search/email/url/tel.
- **Einzelauswahl:** `kern-segmented` für 2–5 kurze Optionen, `kern-radio-group` mit `kern-radio` (`label`,
  `description`) für längere oder beschriebene; ein Tab-Stopp, Pfeile wählen. `kern-select` ab etwa 6 Optionen.
- **Optionen** für `kern-select` und `kern-segmented` kommen aus der Property `options` oder aus Kind-`<option>`;
  Änderungen an den Kindern werden übernommen (`@for` funktioniert).
- **Auswahlliste:** `kern-select` öffnet eine eigene Liste (Popover über allem, nicht abgeschnitten von Karten oder
  Tabellen) mit Tastaturbedienung (Pfeile, Home/End, Buchstaben, Enter, Escape). Elemente mit `slot="footer"`
  erscheinen unter der Liste, z.B. `<kern-button slot="footer" variant="ghost" size="sm">Standorte bearbeiten …</kern-button>`;
  ein Klick darauf schliesst die Liste. `placeholder` zeigt einen Text, solange nichts gewählt ist.
  `searchable` setzt ein Suchfeld oben in die Liste (filtert nach Teilstring, Pfeile/Enter wählen; ein Buchstabe am
  geschlossenen Feld startet die Suche). `multiple` macht `value` zum `string[]` (Attribut auch `"a,b"`): Chips mit ×
  im Feld, Backspace entfernt den letzten, die Liste bleibt offen und schaltet um, das Formular bekommt einen Eintrag
  pro Wert.
- **Aufklappen:** `kern-accordion` mit `kern-accordion-item` (`heading` oder `slot="heading"`, `open`, `disabled`) auf
  `<details>`; ohne `multiple` schliesst das Öffnen eines Abschnitts die anderen. Event `kernToggle` mit `{ open }`.
- **Pfad:** `kern-breadcrumb` mit Kind-Links (`kern-link`/`a`), das letzte Kind ist die aktuelle Seite
  (`aria-current="page"`); `max-items` faltet die mittleren Ebenen in ein «…»-Menü, das den Original-Link klickt.
- **Seiten:** `kern-pagination` unter Tabellen/Listen mit `total`, `page`, `page-size` und optional `page-sizes="10,25,50"`;
  zeigt «1–25 von 380», Seitenzahlen mit «…» (feste Anzahl Plätze) und meldet `kernPageChange` mit `{ page, pageSize }`.
  Beim Wechsel der Seitengrösse bleibt der erste sichtbare Eintrag auf der Seite.
- **Tabellen:** `kern-table` umschliesst eine native `<table>` ohne Shadow DOM, damit Zellen beliebiges Markup und
  Framework-Bindings enthalten können. Zellklassen `mono`, `num`, `empty`; Zeilen `clickable`, `dim`,
  `aria-selected="true"`; sortierbar mit `<th aria-sort><button>`. `selectable` ergänzt eine Auswahlspalte mit
  Kopf-Checkbox (sichtbare Zeilen der Seite); Schlüssel aus `data-key` bzw. `rowKey`, Zustand in `selected`, Event
  `kernSelectionChange` mit `{ selected }`. Detail-Zeilen: `<tr kern-details>` direkt nach ihrer Zeile, aufgeklappt
  mit `<button kern-expand>` (im Datenmodus `detail`); Zustand in `expanded`, Event `kernRowToggle`, `toggleRow()`.
  Spalten im Datenmodus: `columnState` blendet Spalten per `key` ein/aus, ordnet und fixiert sie; `kern-table-columns`
  bearbeitet den Zustand und meldet `kernColumnsChange`.
- **Laden:** `kern-skeleton` als Platzhalter in Form des Inhalts (`variant="text"` mit `lines`, `"block"` mit
  `width`/`height`, `"circle"` mit `size`); statisch bei reduzierter Bewegung, für Screenreader verborgen. Den Container
  dabei mit `aria-busy="true"` markieren. `kern-spinner`/`kern-progress` für Vorgänge ohne Inhaltsform.
- **Toasts:** `await toast({ message, tone, heading, actionLabel, duration })` zeigt eine kurze Rückmeldung unten
  rechts (höchstens 4, über offenen Dialogen) und liefert `'timeout' | 'close' | 'action'`. Schliesst nach 5 s
  (pausiert bei Hover/Fokus), `duration: 0` bleibt. Für Meldungen, die stehen bleiben müssen: `kern-alert`.
  Während ein modaler Dialog offen ist, ist alles ausserhalb inert: Toasts sind dann sichtbar, aber weder bedienbar
  noch angesagt. Darum erst den Dialog schliessen, dann den Toast zeigen. Die Region heisst für Screenreader
  wie der Kern-Text `toast.regionLabel` («Notifications», deutsch «Benachrichtigungen») und folgt der Sprache;
  `setToastRegionLabel()` legt einen eigenen Namen fest (wirkt auch auf eine bestehende Region).
- **Seitenpanel:** `kern-drawer` (rechts, `side="start"` links, `width`) für Details, Filter und längere Formulare;
  modal auf `<dialog>`, Kopf und Fuss stehen, der Inhalt scrollt. Escape, × und Klick auf den Hintergrund schliessen
  (`dismissible="false"` verhindert das). Kurze Bestätigungen bleiben `kern-dialog`/`confirm()`.
- **Anfangsfokus:** `autofocus` an einem Kern-Feld in `kern-drawer` oder `kern-dialog` setzt beim Öffnen den Fokus
  dorthin statt auf den Schliessen-Knopf; `kernOpen` meldet das Öffnen.
- **Bestätigen:** `await confirm({ heading, message, confirmLabel, danger, typeToConfirm })` öffnet einen
  `kern-dialog`. Mit `typeToConfirm` (z.B. die MAC) bleibt die Bestätigung gesperrt, bis der Wert eingetippt ist.
  Ein Array erlaubt Alternativen (`['Boiler', mac]`), `normalize: 'mac'` akzeptiert die MAC in jeder Schreibweise.
- **Datum & Zeit:** Werte sind ISO-Strings (`2026-10-19`, `2026-10-19T08:15:00Z`, `06:30`, `PT1H23M`), Epoch-ms oder
  `Date`; Dauern auch in Sekunden (`duration="5025"`). Formatiert wird mit `Intl` nach `locale`, sonst `<html lang>`,
  sonst Browser. `<kern-date relative>` aktualisiert sich selbst («vor 3 Min.», «gestern»), der absolute Wert steht
  im Tooltip. Ungültige Werte erscheinen unverändert.
- **Kalender:** `kern-calendar` wählt ein Datum (`value`) oder mit `range` einen Bereich (`start`/`end`, zweiter Klick
  schliesst ab, Escape verwirft); `months="2"` zeigt zwei Monate. Grenzen per `min`/`max` und
  `isDateDisabled = (iso) => boolean` (Property). Wochenstart aus der Locale, Tastatur wie im WAI-ARIA-Datepicker
  (Pfeile, Home/End, Bild↑/↓, mit Shift jahrweise).
- **Datum/Zeit eingeben:** `kern-date-picker` hat den Wert ISO (`2026-10-19`), zeigt und akzeptiert aber das Format
  der Locale («19.10.2026», auch «19.10.» oder ISO). Übernommen wird mit Enter oder beim Verlassen; ungültige oder
  nicht erlaubte Daten (`min`/`max`/`isDateDisabled`) machen das Feld ungültig. Pfeil↓ öffnet den Kalender, Slot
  `footer` für Aktionen wie «Heute». `kern-time-picker` hat Segmente (Std/Min/[Sek]/[AM/PM]): Pfeile ändern
  (Minuten in `step` Sekunden), Ziffern tippen, Backspace leert; `list` zeigt eine Auswahlliste, `min`/`max` begrenzen.
- **Zeitraum:** `kern-date-range-picker` hat `start`/`end` (ISO) und `value` als ISO-Intervall `start/end` (auch der
  Formular- und Angular-Wert; leer, solange ein Datum fehlt). `kernChange` kommt nur für vollständige oder geleerte
  Bereiche. Ein Ende vor dem Start wird getauscht, `max-days` begrenzt die Länge. Im Popover zwei Monate (schmal: einer).
  Schnellauswahl über Slot `presets`: Elemente mit `data-range="P7D"` (Dauer bis heute, inkl. heute) oder
  `data-start`/`data-end`.
- **Zahlen mit − / +:** `kern-step-input` hat `min`, `max`, `step` und `unit`; Getipptes wird mit Enter oder beim
  Verlassen übernommen, begrenzt und auf die Nachkommastellen von `step` gerundet (Dezimalkomma nach Locale). Pfeil↑/↓
  ± `step`, Bild↑/↓ ± 10 × `step`, Home/End = `min`/`max`, Buttons wiederholen beim Halten. `value` ist eine Zahl oder
  `''`, `kernChange` liefert `null` für leer.
- **Schieberegler:** `kern-range` mit `min`, `max`, `step`, `unit` und optional `marks="0,50,100"`; Ziehen oder Klick auf
  die Spur, Tastatur wie nativ (Pfeile, Bild↑/↓ = ein Zehntel, Home/End). `range` gibt zwei Griffe, Wert `"von/bis"`.
  `kernInput` beim Ziehen, `kernChange` beim Loslassen.
- **Farbe:** `kern-color-picker` mit Farbfeld und Hex-Eingabe; im Panel Sättigung/Helligkeit, Farbton und `swatches`.
  `mode="temperature"` wählt Weisstöne in Kelvin (`min-kelvin`–`max-kelvin`, Standard 2700–6500). Fläche und Leisten per
  Maus und Tastatur (Pfeile, Shift = grössere Schritte). Wert `#rrggbb` bzw. Kelvin.
- **Bewertung:** `kern-rating` ist eine Radiogruppe aus `max` Sternen (Standard 5) mit einem Tab-Stopp; Pfeile,
  Home/End und Ziffern setzen den Wert, `clearable` erlaubt 0 (0/Backspace oder Klick auf den aktuellen Stern).
  `readonly` zeigt nur an («4 von 5 Sternen»). Wert ist eine Zahl, im Formular leer bei 0.
- **Listen:** `kern-list` mit `kern-list-item` für Zeilen mit Icon/Status (`slot="start"`), Titel, Beschreibung, Meta
  (`slot="meta"`, z.B. `kern-date relative`) und Aktionen (`slot="end"`). Mit `href` wird die Zeile ein Link, mit
  `clickable` ein Button (`kernItemClick`); Aktionen liegen daneben und lösen die Zeile nie aus. `flush` in Karten,
  `empty` für die leere Liste.
- **Icons:** `<kern-icon name="wifi">` folgt `font-size` und `currentColor`; ohne `label` dekorativ, mit `label` als
  Bild angesagt. Namen (auch als `ICON_NAMES` exportiert): `sun`, `moon`, `copy`, `check`, `close`, `chevron-down`,
  `chevron-up`, `chevron-left`, `chevron-right`, `calendar`, `clock`, `minus`, `plus`, `star`, `more`, `menu`,
  `search`, `filter`, `settings`, `edit`, `trash`, `refresh`, `power`, `download`, `upload`, `link`, `lock`, `eye`,
  `eye-off`, `info`, `warn`, `wifi`, `inbox`, `home`, `bulb`, `thermometer`, `external`.
  Marken-Icons mit Präfix `brand-` (`BRAND_NAMES`): `brand-home-assistant`, `brand-zigbee`, `brand-mqtt`,
  `brand-shelly`, `brand-esphome`, `brand-github`, `brand-google` u.a.; `brand-color` zeigt die offizielle Farbe.
  Quelle: [Simple Icons](https://simpleicons.org) (CC0), Auswahl und Erzeugung in `scripts/build-brands.mjs`
  (`npm run brands`). `brand-microsoft`, `brand-z-wave` ([Material Design Icons](https://pictogrammers.com/library/mdi/),
  Apache 2.0), `brand-matter` ([Material Symbols](https://fonts.google.com/icons), Apache 2.0) und `brand-alexa`
  ([Bootstrap Icons](https://icons.getbootstrap.com), MIT) stammen aus anderen Sets, weil die Inhaber sie aus Simple
  Icons entfernen liessen. Die Logos sind Marken ihrer Inhaber: nur zum Verweis auf das Produkt verwenden. Thread,
  HomeKit und UniFi fehlen (UniFi: `brand-ubiquiti`).
- **Menüs:** `kern-menu` mit Auslöser in `slot="trigger"` (z.B. `kern-button icon-only` mit `kern-icon name="more"`),
  `kern-menu-item` (`value`, `icon`, `tone="danger"`, `disabled`) und `<hr>` als Trenner. Tastatur: Enter/Leertaste/Pfeil
  öffnen, Pfeile/Home/End/Buchstaben bewegen, Escape/Tab schliessen; `kernSelect` liefert `{ value }`. `align="end"`
  für Menüs am Zeilenende.
- **Tooltips:** `kern-tooltip text="…"` um den Auslöser oder mit `for="id"`; erscheint nach `delay` (400 ms) bei
  Hover und sofort bei Tastaturfokus, Escape schliesst. Nur Ergänzungen (Touch sieht sie nie); bei Icon-Buttons
  bleibt `label` der Name.
- **Code:** `kern-code` für Befehle und Konfiguration mit Kopieren-Button, `language="shell|powershell|yaml|json|js|ts|ini|html|ruby|go"`
  (Aliase `ps1`, `pwsh`, `rb`, `golang`; Hervorhebung ohne Abhängigkeit, Farben aus den Tokens), `heading`, `line-numbers`, `wrap`, `max-height`; Inhalt aus
  `code` oder dem Text (Einrückung wird entfernt). `inline` für Pfade und Befehle im Fliesstext. JSON-Daten als Baum:
  `kern-json`. Angular fasst Leerraum in Templates zusammen: dort `[code]="…"` binden oder `ngPreserveWhitespaces`
  setzen.
- **Logs:** `kern-log` für strukturierte Einträge (`entries`: `{ id, time, level, message, source?, details? }`) mit Suche,
  Stufen- und Quellenfilter, `follow` (am Ende mitlaufen, beim Zurückscrollen Position halten), `paused`, Kopieren und
  Download. Die App liefert neue Arrays und begrenzt ihren Puffer selbst (gleiche Grenze wie `max-entries`).
- **Links:** `kern-link` für Links im Text, in Tabellen und Karten; `external` öffnet einen neuen Tab (mit
  `rel="noopener noreferrer"`, ↗ und Hinweis für Screenreader), `tone="muted"` für Nebensächliches. Aktionen bleiben
  `kern-button` (auch mit `href`).
- **SPA-Router:** `kern-button`, `kern-link` und `kern-list-item` mit `href` dürfen Router-Links sein. Ein normaler
  Linksklick löst vorher das abbrechbare `kernNavigate` mit `{ href, event }` aus; `preventDefault()` verhindert den
  Seitenwechsel, und die App routet selbst, z.B. in Angular
  `(kernNavigate)="$event.preventDefault(); router.navigateByUrl($event.detail.href)"`. Ctrl/Cmd-Klick, Mittelklick,
  `target="_blank"` und `download` bleiben beim Browser, «In neuem Tab öffnen» geht weiter.
- **Theming von aussen:** nur über Tokens (CSS-Variablen) und die dokumentierten `::part()`; keine Farben in Apps
  erfinden.
- **Texte:** Standardtexte (Aria-Labels, Fehlermeldungen, «Cancel») liefert Kern englisch und deutsch. Die Sprache
  kommt aus `setKernLocale()`, sonst aus `<html lang>` (auch bei späteren Wechseln), sonst Englisch;
  `setKernStrings(locale, { 'kern-pagination.labelNext': '…' })` ergänzt Sprachen oder ersetzt einzelne Texte.
  Eine Prop an der Komponente (`label-next`, `close-label` …) hat immer Vorrang. Bis 0.8 waren die Defaults deutsch:
  Apps, die das brauchen, setzen `<html lang="de">` oder `setKernLocale('de')`.

## Entwicklung

```bash
npm install
npm start        # Demo mit Watch unter http://localhost:3333
npm test         # Spec-Tests (Jest)
npm run build    # dist/, loader/, www/, Angular-Wrapper, readme.md pro Komponente
npm run docs     # Dokumentation nach site/ (Beispiele: src/components/<tag>/usage/*.md, Muster: docs/patterns/*.md)
npm run docs:serve  # http://localhost:4321/kern/
npm run e2e      # Browser-Tests (Playwright), siehe «Browser-Tests»
```

- Node 24 (`.nvmrc`), Stencil 4.45.
- Vor einem PR: `npm test` und `npm run docs` (baut auch die Bibliothek). Dasselbe prüft der Workflow `ci.yml`
  bei jedem Pull Request und auf `main`, dazu parallel die Browser-Tests (`npm run e2e`).
- Tokens nur in `tokens/tokens.json` ändern; `npm run tokens` (läuft bei build/test/start mit) erzeugt
  `src/global/tokens.css`.
- Komponenten-Styles nutzen ausschliesslich Tokens (`var(--surface)`, `var(--space-4)` …).
- Neue Komponente: Name nach «Benennung», `npm run generate`, Doku-Kommentar über der Klasse (erster Satz =
  Zusammenfassung), Props mit JSDoc, Spec-Test für Logik.

### Browser-Tests

Eine kleine Playwright-Suite in `e2e/` prüft, was Spec-Tests nur nachbilden: ElementInternals in echten Formularen
(FormData, Reset, disabled fieldset, Constraint-Validierung), Select und Combobox mit Tastatur, Escape und
Light-Dismiss, Popovers in einem modalen Dialog sowie Fokus in Dialog und Drawer.

```bash
npx playwright install --with-deps   # einmalig: Browser und Systempakete
npm run e2e                          # baut, startet den Server und testet in Chromium, Firefox und WebKit
npx playwright test --project=webkit # nur eine Engine (setzt einen Build voraus)
npx playwright show-report           # HTML-Bericht des letzten Laufs
```

- Die Testseiten liegen in `e2e/fixtures/` und laden `dist/kern` (Loader und `kern.css`). Sie hängen nicht von
  den Doku-Texten ab. `scripts/e2e-fixtures.mjs` kopiert sie nach `site/e2e/`, `scripts/serve-docs.mjs` liefert sie
  auf Port 4329 aus; beides startet Playwright selbst (`webServer` in `playwright.config.ts`).
- WebKit ist der WebKit-Build von Playwright, kein Test auf Safari oder einem Apple-Gerät.
- Bei Fehlern bleiben Trace und Screenshot in `test-results/` (`npx playwright show-trace <trace.zip>`). Der Job
  `e2e` in `ci.yml` lädt Bericht und Traces dann als Artefakt `playwright-report` hoch.
- In der CI läuft der Job `e2e` im offiziellen Image `mcr.microsoft.com/playwright:v<Version>-noble` (Version aus
  `package.json`). Browser und Systempakete sind dort vorinstalliert, es gibt keinen apt-Download pro Lauf. Lokal
  dasselbe: `docker run --rm -it -v "$PWD":/work -w /work --ipc=host mcr.microsoft.com/playwright:v<Version>-noble`.
- Keine festen Wartezeiten: Assertions wie `toBeVisible()` oder `toBeFocused()` warten selbst.
- Findet ein Test einen echten Fehler, wird dieser als Bug-Issue gemeldet und der Test bis zum Fix mit
  `test.fixme` und Verweis aufs Issue markiert.

### Release

1. Version heben (`npm version <x.y.z> --no-git-tag-version`) und per PR nach `main` mergen.
2. Auf `main` einen GitHub-Release mit Tag `v<x.y.z>` veröffentlichen (`gh release create v<x.y.z> --generate-notes`).
3. Der Workflow `release.yml` prüft, dass Tag und `package.json` übereinstimmen, testet, baut und stellt das
   Paket per npm Trusted Publishing bereit (`npm stage publish`, mit Provenance, ohne Token). Vorabversionen wie
   `0.7.0-beta.1` bekommen das dist-tag `next`.
4. Die gestagte Version auf npmjs.com freigeben oder lokal mit `npm stage list @yfridelance/kern` und
   `npm stage approve <id>` (verlangt 2FA). Erst dann ist sie installierbar.

Schlägt der Lauf zum Release fehl, lässt er sich für denselben Tag erneut starten:
`gh workflow run release.yml -f tag=v<x.y.z>`.

## Lizenz

MIT
