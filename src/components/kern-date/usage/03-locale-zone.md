# Locale and time zone

`locale` overrides the language (default: `<html lang>`, then the browser), `time-zone` takes an IANA zone (default: the browser's). The same point in time, shown for different places:

```html
<kern-kv>
  <kern-kv-item label="Zurich (de-CH)"><kern-date value="2026-10-19T07:41:00Z" time locale="de-CH" time-zone="Europe/Zurich"></kern-date></kern-kv-item>
  <kern-kv-item label="London (en-GB)"><kern-date value="2026-10-19T07:41:00Z" time locale="en-GB" time-zone="Europe/London"></kern-date></kern-kv-item>
  <kern-kv-item label="New York (en-US)"><kern-date value="2026-10-19T07:41:00Z" time locale="en-US" time-zone="America/New_York"></kern-date></kern-kv-item>
  <kern-kv-item label="Tokyo (ja-JP)"><kern-date value="2026-10-19T07:41:00Z" time format="long" locale="ja-JP" time-zone="Asia/Tokyo"></kern-date></kern-kv-item>
</kern-kv>
```
