import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { positionPopup } from '../../utils/popover';
import { hexToRgb, hsvToRgb, kelvinToRgb, parseHex, rgbToHex, rgbToHsv, type Hsv } from '../../utils/color';

let nextId = 0;

/**
 * Colour field for smart-home lights, form-associated. `mode="color"`: `value` is `#rrggbb`; the popover has a
 * saturation/brightness area, a hue bar and `swatches`. `mode="temperature"`: `value` is a colour temperature in
 * Kelvin (`min-kelvin`–`max-kelvin`) on a warm-to-cold bar. The hex or Kelvin text can be typed (Enter or leaving
 * applies it). Area and bars work with pointer and keys (Arrows, Shift = larger steps, Home/End on bars).
 *
 * @part control - The field box
 * @part panel - The popover
 */
@Component({
  tag: 'kern-color-picker',
  styleUrl: 'kern-color-picker.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernColorPicker {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  /** `#rrggbb`, or Kelvin with `mode="temperature"`. */
  @Prop({ mutable: true }) value: string | number = '';
  @Prop() name?: string;
  @Prop({ reflect: true }) mode: 'color' | 'temperature' = 'color';
  /** Presets: hex colours, or Kelvin values with `mode="temperature"`, e.g. `#ff8a3c,#3cc8cc` or `2700,4000,6500`. */
  @Prop() swatches: string[] | string = '';
  @Prop() minKelvin = 2700;
  @Prop() maxKelvin = 6500;
  @Prop() kelvinStep = 100;
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  @Prop({ reflect: true }) disabled = false;
  @Prop() readonly = false;
  @Prop() required = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;
  @Prop() labelOpen = 'Farbe wählen';
  @Prop() labelArea = 'Sättigung und Helligkeit';
  @Prop() labelHue = 'Farbton';
  @Prop() labelTemperature = 'Farbtemperatur';
  @Prop() labelInvalid = 'Keine gültige Farbe';

  /** While dragging or stepping. */
  @Event() kernInput!: EventEmitter<{ value: string | number }>;
  /** When a colour is applied (drag end, key, swatch, typed text). */
  @Event() kernChange!: EventEmitter<{ value: string | number }>;

  @State() hsv: Hsv = { h: 0, s: 0, v: 0 };
  @State() text = '';
  @State() open = false;
  @State() problem?: string;

  private box?: HTMLElement;
  private popup?: HTMLElement;
  private area?: HTMLElement;
  private hueBar?: HTMLElement;
  private kelvinBar?: HTMLElement;
  private drag?: 'area' | 'hue' | 'kelvin';
  private dragStart: string | number = '';
  private wasOpen = false;
  private uid = `kern-color-picker-${++nextId}`;
  private initial: string | number = '';

  private get temperature(): boolean {
    return this.mode === 'temperature';
  }

  componentWillLoad() {
    this.initial = this.value;
    this.onValue();
  }

  componentDidLoad() {
    this.sync();
    const p = this.popup;
    if (!p) return;
    p.setAttribute('popover', 'auto');
    p.addEventListener('toggle', (e) => {
      this.open = (e as ToggleEvent).newState === 'open';
      if (this.open) requestAnimationFrame(() => this.position());
    });
  }

  private get kelvin(): number | null {
    const n = Number(this.value);
    return this.value !== '' && Number.isFinite(n) ? this.clampKelvin(n) : null;
  }

  private clampKelvin(n: number): number {
    return Math.max(this.minKelvin, Math.min(this.maxKelvin, Math.round(n / this.kelvinStep) * this.kelvinStep));
  }

  /** The colour currently shown (also for temperatures). */
  private get hex(): string | null {
    if (this.temperature) return this.kelvin === null ? null : rgbToHex(kelvinToRgb(this.kelvin));
    return parseHex(String(this.value ?? ''));
  }

  @Watch('value')
  @Watch('mode')
  onValue() {
    if (this.temperature) {
      this.text = this.kelvin === null ? '' : String(this.kelvin);
    } else {
      const hex = parseHex(String(this.value ?? ''));
      if (hex && hex !== this.value) {
        this.value = hex; // normalise, e.g. „#ABC“ → „#aabbcc“; the watcher runs again
        return;
      }
      // Keep the hue when the colour has none (grey), so the area does not jump to red.
      if (hex) {
        const next = rgbToHsv(hexToRgb(hex));
        this.hsv = next.s === 0 ? { ...next, h: this.hsv.h } : next;
      }
      this.text = hex ?? String(this.value ?? '');
    }
    this.problem = undefined;
    this.sync();
  }

  @Watch('error')
  @Watch('required')
  @Watch('problem')
  sync() {
    const v = this.value === '' || this.value === null || this.value === undefined ? '' : String(this.value);
    this.internals?.setFormValue?.(v);
    const message = this.error ?? this.problem;
    if (message) this.internals?.setValidity?.({ customError: true }, message, this.box);
    else if (this.required && !v) this.internals?.setValidity?.({ valueMissing: true }, 'required', this.box);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = this.initial;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  /** Opens the colour panel. */
  @Method()
  async show() {
    this.openPanel();
  }

  /** Closes the colour panel. */
  @Method()
  async hide() {
    (this.popup as HTMLElement & { hidePopover?: () => void })?.hidePopover?.();
  }

  private openPanel() {
    if (this.disabled || this.readonly || this.open || !this.popup) return;
    (this.popup as HTMLElement & { showPopover?: () => void }).showPopover?.();
  }

  private position() {
    if (this.box && this.popup) positionPopup(this.box, this.popup);
  }

  /** Set a new value; `final` emits kernChange as well. */
  private emit(value: string | number, final: boolean) {
    const changed = value !== this.value;
    if (changed) {
      this.value = value;
      this.kernInput.emit({ value });
    }
    if (final && value !== this.dragStart) this.kernChange.emit({ value });
  }

  private setHsv(next: Hsv, final: boolean) {
    this.hsv = next;
    this.emit(rgbToHex(hsvToRgb(next)), final);
  }

  // ---------- pointer ----------

  private ratio(ev: PointerEvent, el: HTMLElement): [number, number] {
    const r = el.getBoundingClientRect();
    const x = r.width ? Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) : 0;
    const y = r.height ? Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height)) : 0;
    return [x, y];
  }

  private applyPointer(ev: PointerEvent, final: boolean) {
    if (this.drag === 'area' && this.area) {
      const [x, y] = this.ratio(ev, this.area);
      this.setHsv({ ...this.hsv, s: x, v: 1 - y }, final);
    } else if (this.drag === 'hue' && this.hueBar) {
      const [x] = this.ratio(ev, this.hueBar);
      this.setHsv({ ...this.hsv, h: Math.min(359.9, x * 360) }, final);
    } else if (this.drag === 'kelvin' && this.kelvinBar) {
      const [x] = this.ratio(ev, this.kelvinBar);
      this.emit(this.clampKelvin(this.minKelvin + x * (this.maxKelvin - this.minKelvin)), final);
    }
  }

  private onDown = (target: 'area' | 'hue' | 'kelvin') => (ev: PointerEvent) => {
    if (ev.button !== 0 || this.disabled) return;
    ev.preventDefault();
    const el = ev.currentTarget as HTMLElement;
    this.drag = target;
    this.dragStart = this.value;
    el.focus();
    el.setPointerCapture?.(ev.pointerId);
    this.applyPointer(ev, false);
  };

  private onMove = (ev: PointerEvent) => {
    if (this.drag) this.applyPointer(ev, false);
  };

  private onUp = (ev: PointerEvent) => {
    if (!this.drag) return;
    (ev.currentTarget as HTMLElement).releasePointerCapture?.(ev.pointerId);
    this.drag = undefined;
    if (this.value !== this.dragStart) this.kernChange.emit({ value: this.value });
  };

  // ---------- keyboard ----------

  private keyStep(ev: KeyboardEvent, apply: (dx: number, dy: number, edge?: 'start' | 'end') => void) {
    const big = ev.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-big, 0], ArrowRight: [big, 0], ArrowUp: [0, big], ArrowDown: [0, -big] };
    if (ev.key in moves) {
      ev.preventDefault();
      this.dragStart = this.value;
      apply(...moves[ev.key]);
    } else if (ev.key === 'Home' || ev.key === 'End') {
      ev.preventDefault();
      this.dragStart = this.value;
      apply(0, 0, ev.key === 'Home' ? 'start' : 'end');
    }
  }

  private onAreaKey = (ev: KeyboardEvent) =>
    this.keyStep(ev, (dx, dy) => {
      const c = (n: number) => Math.max(0, Math.min(1, n));
      this.setHsv({ ...this.hsv, s: c(this.hsv.s + dx / 100), v: c(this.hsv.v + dy / 100) }, true);
    });

  private onHueKey = (ev: KeyboardEvent) =>
    this.keyStep(ev, (dx, dy, edge) => {
      const h = edge === 'start' ? 0 : edge === 'end' ? 359 : (this.hsv.h + dx + dy + 360) % 360;
      this.setHsv({ ...this.hsv, h }, true);
    });

  private onKelvinKey = (ev: KeyboardEvent) =>
    this.keyStep(ev, (dx, dy, edge) => {
      const cur = this.kelvin ?? this.minKelvin;
      const k = edge === 'start' ? this.minKelvin : edge === 'end' ? this.maxKelvin : cur + (dx + dy) * this.kelvinStep;
      this.emit(this.clampKelvin(k), true);
    });

  // ---------- text and swatches ----------

  private commit() {
    const t = this.text.trim();
    this.dragStart = this.value;
    if (!t) return this.emit('', true);
    if (this.temperature) {
      const n = Number(t.replace(/\s*k$/i, ''));
      if (!Number.isFinite(n)) {
        this.problem = this.labelInvalid;
        return;
      }
      const k = this.clampKelvin(n);
      this.emit(k, true);
      this.text = String(k);
      return;
    }
    const hex = parseHex(t);
    if (!hex) {
      this.problem = this.labelInvalid;
      return;
    }
    this.emit(hex, true);
    this.text = hex;
  }

  private get swatchList(): string[] {
    const s = this.swatches;
    return (Array.isArray(s) ? s : String(s ?? '').split(',')).map((x) => String(x).trim()).filter(Boolean);
  }

  private pickSwatch(s: string) {
    this.dragStart = this.value;
    if (this.temperature) this.emit(this.clampKelvin(Number(s)), true);
    else {
      const hex = parseHex(s);
      if (hex) this.emit(hex, true);
    }
  }

  render() {
    const message = this.error ?? this.problem;
    const describedBy = message ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    const hex = this.hex;
    // Not `h`: that name is the JSX factory.
    const { h: hue, s: sat, v: val } = this.hsv;
    const k = this.kelvin ?? this.minKelvin;
    const kPct = ((k - this.minKelvin) / Math.max(1, this.maxKelvin - this.minKelvin)) * 100;
    const kStops = [0, 0.25, 0.5, 0.75, 1].map((t) => `${rgbToHex(kelvinToRgb(this.minKelvin + t * (this.maxKelvin - this.minKelvin)))} ${t * 100}%`).join(', ');
    const locked = this.disabled || this.readonly;
    return (
      <Host invalid={!!message}>
        {this.label && (
          <label class="label" htmlFor={this.uid}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        <div ref={(el) => (this.box = el)} class={{ control: true, box: true, disabled: this.disabled }} part="control">
          <button
            type="button"
            class={{ swatch: true, empty: !hex }}
            style={{ background: hex ?? 'transparent' }}
            aria-label={this.labelOpen}
            title={this.labelOpen}
            aria-haspopup="dialog"
            aria-expanded={this.open ? 'true' : 'false'}
            disabled={locked}
            onPointerDown={() => (this.wasOpen = this.open)}
            onClick={() => {
              if (this.wasOpen) {
                this.wasOpen = false;
                return;
              }
              this.openPanel();
            }}
          />
          <input
            id={this.uid}
            class="text"
            type="text"
            inputMode={this.temperature ? 'numeric' : 'text'}
            autocomplete="off"
            spellcheck={false}
            value={this.text}
            placeholder={this.temperature ? String(Math.round((this.minKelvin + this.maxKelvin) / 200) * 100) : '#3cc8cc'}
            disabled={this.disabled}
            readOnly={this.readonly}
            aria-label={this.label ? undefined : this.ariaLabelText}
            aria-invalid={message ? 'true' : undefined}
            aria-describedby={describedBy}
            onInput={(e) => {
              this.text = (e.target as HTMLInputElement).value;
              if (this.problem) this.problem = undefined;
            }}
            onChange={() => this.commit()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') this.commit();
              if (e.key === 'ArrowDown' && e.altKey) this.openPanel();
            }}
          />
          {this.temperature && <span class="unit">K</span>}
        </div>
        <div ref={(el) => (this.popup = el)} class="popup panel" part="panel" role="dialog" aria-label={this.label ?? this.labelOpen}>
          {this.temperature ? (
            <div
              ref={(el) => (this.kelvinBar = el)}
              class="bar kelvin"
              style={{ background: `linear-gradient(90deg, ${kStops})` }}
              role="slider"
              tabindex={0}
              aria-label={this.labelTemperature}
              aria-valuemin={this.minKelvin}
              aria-valuemax={this.maxKelvin}
              aria-valuenow={k}
              aria-valuetext={`${k} K`}
              onPointerDown={this.onDown('kelvin')}
              onPointerMove={this.onMove}
              onPointerUp={this.onUp}
              onPointerCancel={this.onUp}
              onKeyDown={this.onKelvinKey}
            >
              <span class="knob" style={{ left: `${kPct}%`, background: hex ?? 'transparent' }} />
            </div>
          ) : (
            [
              <div
                ref={(el) => (this.area = el)}
                class="area"
                style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue} 100% 50%))` }}
                role="slider"
                tabindex={0}
                aria-label={this.labelArea}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(sat * 100)}
                aria-valuetext={`Sättigung ${Math.round(sat * 100)} %, Helligkeit ${Math.round(val * 100)} %`}
                onPointerDown={this.onDown('area')}
                onPointerMove={this.onMove}
                onPointerUp={this.onUp}
                onPointerCancel={this.onUp}
                onKeyDown={this.onAreaKey}
              >
                <span class="knob" style={{ left: `${sat * 100}%`, top: `${(1 - val) * 100}%`, background: hex ?? 'transparent' }} />
              </div>,
              <div
                ref={(el) => (this.hueBar = el)}
                class="bar hue"
                role="slider"
                tabindex={0}
                aria-label={this.labelHue}
                aria-valuemin={0}
                aria-valuemax={359}
                aria-valuenow={Math.round(hue)}
                onPointerDown={this.onDown('hue')}
                onPointerMove={this.onMove}
                onPointerUp={this.onUp}
                onPointerCancel={this.onUp}
                onKeyDown={this.onHueKey}
              >
                <span class="knob" style={{ left: `${(hue / 360) * 100}%`, background: `hsl(${hue} 100% 50%)` }} />
              </div>,
            ]
          )}
          {this.swatchList.length > 0 && (
            <div class="swatches">
              {this.swatchList.map((sw) => {
                const color = this.temperature ? rgbToHex(kelvinToRgb(Number(sw))) : (parseHex(sw) ?? 'transparent');
                const label = this.temperature ? `${sw} K` : sw;
                const current = this.temperature ? String(this.kelvin) === sw : parseHex(sw) === hex;
                return <button type="button" class={{ preset: true, current }} style={{ background: color }} aria-label={label} title={label} aria-pressed={current ? 'true' : 'false'} onClick={() => this.pickSwatch(sw)} />;
              })}
            </div>
          )}
        </div>
        {message ? (
          <span class="error" id={`${this.uid}-error`}>
            {message}
          </span>
        ) : (
          this.hint && (
            <span class="hint" id={`${this.uid}-hint`}>
              {this.hint}
            </span>
          )
        )}
      </Host>
    );
  }
}
