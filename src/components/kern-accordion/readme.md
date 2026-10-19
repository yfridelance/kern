# kern-accordion



<!-- Auto Generated Below -->


## Overview

Collapsible sections (advanced settings, FAQ, log groups): kern-accordion-item children in a bordered box.
Without `multiple` opening one closes the others.

## Usage

### 01-basic

# Settings sections

Each kern-accordion-item is a collapsible section; `open` expands it initially. Opening one closes the others. Use the `heading` slot instead of the `heading` attribute for richer content, and `disabled` for a section that cannot be opened.

```html
<kern-accordion style="max-width:480px">
  <kern-accordion-item heading="Wi-Fi" open>
    <kern-kv>
      <kern-kv-item label="SSID">Haus</kern-kv-item>
      <kern-kv-item label="Mode">Static</kern-kv-item>
    </kern-kv>
  </kern-accordion-item>
  <kern-accordion-item>
    <span slot="heading">MQTT <kern-badge tone="ok">connected</kern-badge></span>
    <kern-kv><kern-kv-item label="Server" mono>192.168.1.5:1883</kern-kv-item></kern-kv>
  </kern-accordion-item>
  <kern-accordion-item heading="Cloud (Gen2+ only)" disabled>Not available.</kern-accordion-item>
</kern-accordion>
```


### 02-multiple

# Several open sections

With `multiple` sections open independently. `flush` drops border and background, e.g. inside a kern-card. Each item emits `kernToggle` when the user opens or closes it.

```html
<kern-card heading="Advanced settings" style="max-width:480px">
  <kern-accordion multiple flush>
    <kern-accordion-item heading="Eco mode" open>Reduces power use; the relay reacts a little slower.</kern-accordion-item>
    <kern-accordion-item heading="Time server" open><kern-code inline>time.google.com</kern-code></kern-accordion-item>
    <kern-accordion-item heading="Debug log">Sends logs over WebSocket to 192.168.1.5.</kern-accordion-item>
  </kern-accordion>
  <p class="out" style="margin:8px 0 0;font-size:13px;color:var(--text-muted)">Toggle a section.</p>
</kern-card>
```

```js
root.querySelector('kern-accordion').addEventListener('kernToggle', (e) => {
  root.querySelector('.out').textContent = `${e.target.heading}: ${e.detail.open ? 'opened' : 'closed'}`;
});
```


### 03-keyboard

# Keyboard

Each heading is a native `<summary>`: Tab moves between headings, Enter or Space toggles the section, and screen readers announce it as expanded or collapsed. Disabled sections are skipped.

```html
<kern-accordion style="max-width:480px">
  <kern-accordion-item heading="Input 1 – Push button">Toggles «Bad Lüftung».</kern-accordion-item>
  <kern-accordion-item heading="Input 2 – Switch">Toggles «Küche Licht».</kern-accordion-item>
  <kern-accordion-item heading="Input 3 – Detached" disabled>No action.</kern-accordion-item>
  <kern-accordion-item heading="Input 4 – Push button">Opens «Rollladen Süd».</kern-accordion-item>
</kern-accordion>
```



## Properties

| Property   | Attribute  | Description                                           | Type      | Default |
| ---------- | ---------- | ----------------------------------------------------- | --------- | ------- |
| `flush`    | `flush`    | Without border and background, e.g. inside kern-card. | `boolean` | `false` |
| `multiple` | `multiple` | Several sections may be open at once.                 | `boolean` | `false` |


## Slots

| Slot | Description                  |
| ---- | ---------------------------- |
|      | kern-accordion-item elements |


----------------------------------------------


