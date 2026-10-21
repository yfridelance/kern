# Compact, own heading and icon

`compact` takes less room, for a table cell, a list or a small card. `heading` replaces the default text, `icon` the glyph (any Kern glyph, see kern-icon); `icon="none"` hides it.

```html
<div style="display:grid;gap:16px;max-width:640px">
  <kern-table>
    <table>
      <thead><tr><th>Name</th><th>IP</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td colspan="3" class="empty">
          <kern-empty-state compact variant="no-results" heading="No offline devices">All 60 devices answered in the last 5 minutes.</kern-empty-state>
        </td></tr>
      </tbody>
    </table>
  </kern-table>
  <kern-card heading="Schedules">
    <kern-empty-state compact icon="clock" heading="No schedules">Switch devices at fixed times, e.g. the Küche Licht at sunset.</kern-empty-state>
  </kern-card>
  <kern-card heading="Notes">
    <kern-empty-state compact icon="none" heading="No notes for this device"></kern-empty-state>
  </kern-card>
</div>
```
