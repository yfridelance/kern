import { Component, Element, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { FLAG_NAMES, type FlagName } from '../../utils/flag-names';
import { kernTexts } from '../../utils/i18n';
import { isPlainNavigation } from '../../utils/navigate';
import type { KernOption } from '../kern-select/kern-select';

/** Flag for a language without region, where the flag of the language's name-giving country is the usual choice. */
const LANGUAGE_FLAGS: Record<string, string> = {
  en: 'gb', de: 'de', fr: 'fr', it: 'it', es: 'es', pt: 'pt', nl: 'nl', da: 'dk', sv: 'se', nb: 'no', nn: 'no', no: 'no',
  fi: 'fi', is: 'is', pl: 'pl', cs: 'cz', sk: 'sk', hu: 'hu', sl: 'si', hr: 'hr', ro: 'ro', bg: 'bg', el: 'gr', tr: 'tr',
  uk: 'ua', ja: 'jp', zh: 'cn', ko: 'kr', ga: 'ie', lb: 'lu', rm: 'ch',
};

interface Language {
  /** BCP 47 code, e.g. `de-CH`. */
  code: string;
  /** Name in the language itself, e.g. «Deutsch». */
  name: string;
  /** Short form, e.g. «DE», or «DE-CH» when two entries share the language. */
  short: string;
  flag?: FlagName;
}

/** Name of a language in itself («Deutsch», «Français»), capitalised; the code when the browser does not know it. */
function ownName(code: string): string {
  try {
    const name = new Intl.DisplayNames([code], { type: 'language' }).of(code);
    if (name && name !== code) return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
  } catch {
    // invalid code
  }
  return code;
}

function flagOf(code: string, explicit?: string | null): FlagName | undefined {
  const [base, ...rest] = code.toLowerCase().split('-');
  const region = rest.find((p) => /^[a-z]{2}$/.test(p));
  const name = `flag-${explicit || region || LANGUAGE_FLAGS[base]}`;
  return (FLAG_NAMES as readonly string[]).includes(name) ? (name as FlagName) : undefined;
}

/**
 * Language switcher: a dropdown with the language names («Deutsch», «English») or short codes («DE», «EN»), optionally
 * with flags, or the languages side by side as links or buttons (`variant="inline"`, good for two or three).
 * Names are shown in their own language and marked with `lang`; codes are announced with the full name.
 *
 * Languages come from `languages` (`de,en,fr`) or from child `<option>` elements, which may set their own name and
 * flag: `<option value="de-CH" data-flag="ch">Schweizerdeutsch</option>`. With `href` (`/{locale}/`) every language
 * is a real link. `kernChange` reports the choice; `preventDefault()` on it stops the navigation, so an app router can
 * take over.
 *
 * @slot - `<option>` elements (read, not shown)
 * @part item - Each language in the inline variant
 * @part active - The current language in the inline variant
 */
@Component({
  tag: 'kern-language-select',
  styleUrl: 'kern-language-select.css',
  shadow: true,
})
export class KernLanguageSelect {
  @Element() el!: HTMLElement;

  /** Current language (BCP 47), e.g. `de` or `de-CH`. */
  @Prop({ mutable: true }) value = '';
  /** Available languages, e.g. `de,en,fr`; child `<option>` elements win. */
  @Prop() languages: string | string[] = '';
  /** `dropdown`, or `inline` for the languages side by side. */
  @Prop({ reflect: true }) variant: 'dropdown' | 'inline' = 'dropdown';
  /** `name` shows «Deutsch», `code` shows «DE». */
  @Prop() display: 'name' | 'code' = 'name';
  /** A flag before each language. A flag names a country, not a language: keep the name or code next to it. */
  @Prop() flags = false;
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  /** Link per language; `{locale}` is replaced by the code, e.g. `/{locale}/`. */
  @Prop() href?: string;
  /** Accessible name of the switcher. */
  @Prop() label?: string;
  @Prop({ reflect: true }) disabled = false;
  private t = kernTexts(this, 'kern-language-select');

  /** A language was chosen. With `href`, `preventDefault()` keeps the page (e.g. to route in the app). */
  @Event({ cancelable: true }) kernChange!: EventEmitter<{ value: string; href?: string }>;

  @State() childLanguages: { code: string; name?: string; flag?: string | null }[] = [];

  private observer?: MutationObserver;

  connectedCallback() {
    this.readChildren();
    if (typeof MutationObserver === 'undefined') return; // server-side / test DOM
    this.observer = new MutationObserver(() => this.readChildren());
    this.observer.observe(this.el, { childList: true, subtree: true, characterData: true, attributes: true });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  private readChildren() {
    this.childLanguages = Array.from(this.el.querySelectorAll('option')).map((o) => ({
      code: o.getAttribute('value') ?? o.textContent?.trim() ?? '',
      name: o.textContent?.trim() || undefined,
      flag: o.getAttribute('data-flag'),
    }));
  }

  private get list(): Language[] {
    const v = this.languages;
    const source = this.childLanguages.length
      ? this.childLanguages
      : (Array.isArray(v) ? v : String(v ?? '').split(/[\s,]+/)).filter(Boolean).map((code) => ({ code, name: undefined, flag: undefined }));
    const entries = source.filter((l) => l.code);
    const bases = entries.map((l) => l.code.split('-')[0].toLowerCase());
    return entries.map((l, i) => ({
      code: l.code,
      name: l.name ?? ownName(l.code),
      short: (bases.indexOf(bases[i]) !== bases.lastIndexOf(bases[i]) ? l.code : bases[i]).toUpperCase(),
      flag: this.flags ? flagOf(l.code, l.flag) : undefined,
    }));
  }

  private link(code: string): string | undefined {
    return this.href?.replace(/\{locale\}/g, encodeURIComponent(code));
  }

  /** Takes and emits the choice; false when the app prevented the navigation. */
  private choose(code: string): boolean {
    this.value = code;
    return !this.kernChange.emit({ value: code, href: this.link(code) }).defaultPrevented;
  }

  private onSelect = (ev: CustomEvent<{ value: string | string[] }>) => {
    ev.stopPropagation(); // the inner kern-select's event; this component emits its own
    const code = String(ev.detail.value);
    if (code === this.value) return;
    if (this.choose(code) && this.href) location.assign(this.link(code)!);
  };

  private onLink = (ev: MouseEvent, code: string) => {
    if (!isPlainNavigation(ev)) return; // new tab, download …: the browser's job
    if (!this.choose(code)) ev.preventDefault();
  };

  private renderDropdown(list: Language[]) {
    const code = this.display === 'code';
    const options: KernOption[] = list.map((l) => ({
      value: l.code,
      label: code ? l.short : l.name,
      icon: l.flag,
      ariaLabel: code ? l.name : undefined,
      lang: l.code,
    }));
    return (
      <kern-select
        class={{ compact: code }}
        size={this.size}
        value={this.value}
        options={options}
        aria-label-text={this.t('label')}
        disabled={this.disabled}
        onKernChange={this.onSelect}
      />
    );
  }

  private renderInline(list: Language[]) {
    const code = this.display === 'code';
    const items = list.map((l) => {
      const active = l.code === this.value;
      // Codes are read with the full name: «DE» alone would be spelled out.
      const content = [l.flag && <kern-icon name={l.flag} />, code ? [<span aria-hidden="true">{l.short}</span>, <span class="sr">{l.name}</span>] : <span>{l.name}</span>];
      const common = { class: { item: true, active }, part: active ? 'item active' : 'item', lang: l.code };
      if (active) {
        return (
          <li>
            <span {...common} aria-current="true">
              {content}
            </span>
          </li>
        );
      }
      const href = this.link(l.code);
      return (
        <li>
          {href ? (
            <a {...common} href={href} hreflang={l.code} aria-disabled={this.disabled ? 'true' : undefined} tabindex={this.disabled ? -1 : undefined} onClick={(e) => (this.disabled ? e.preventDefault() : this.onLink(e, l.code))}>
              {content}
            </a>
          ) : (
            <button {...common} type="button" disabled={this.disabled} onClick={() => this.choose(l.code)}>
              {content}
            </button>
          )}
        </li>
      );
    });
    return (
      <nav aria-label={this.t('label')}>
        <ul>{items}</ul>
      </nav>
    );
  }

  render() {
    const list = this.list;
    return <Host>{this.variant === 'inline' ? this.renderInline(list) : this.renderDropdown(list)}</Host>;
  }
}
