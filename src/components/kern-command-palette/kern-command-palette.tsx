import { Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, forceUpdate, h, type VNode } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { kernTexts } from '../../utils/i18n';
import { searchCommands, type CommandGroup, type CommandHit, type KernCommandItem } from '../../utils/command-search';

let nextId = 0;

/** Palettes with `shortcut`, in the order they were connected. One document listener serves all of them. */
const shortcutPalettes: KernCommandPalette[] = [];

/**
 * Ctrl+K / Cmd+K: an open palette with that key closes; otherwise the last connected one opens, unless a Kern modal
 * is already open. A shortcut another handler already took (`defaultPrevented`) is left alone.
 */
function onShortcut(ev: KeyboardEvent) {
  if (ev.defaultPrevented || ev.repeat || ev.altKey || ev.shiftKey || ev.ctrlKey === ev.metaKey) return;
  const key = ev.key?.toLowerCase();
  const candidates = shortcutPalettes.filter((p) => (p.shortcutKey || 'k').toLowerCase() === key);
  if (!candidates.length) return;
  const open = candidates.find((p) => p.open);
  if (open) {
    ev.preventDefault();
    open.open = false;
    return;
  }
  if (modalOpen(document)) return;
  ev.preventDefault();
  candidates[candidates.length - 1].open = true;
}

/**
 * Whether a modal `<dialog>` is open anywhere, also inside shadow roots: kern-dialog, kern-drawer and other palettes
 * use one, as do the app's own modals. `:modal` holds from `showModal()` on, unlike a reflected `open` attribute that
 * follows only with the next render.
 */
function modalOpen(root: Document | ShadowRoot): boolean {
  for (const el of Array.from(root.querySelectorAll('*'))) {
    if (el.localName === 'dialog' && isModal(el as HTMLDialogElement)) return true;
    if (el.shadowRoot && modalOpen(el.shadowRoot)) return true;
  }
  return false;
}

function isModal(dialog: HTMLDialogElement): boolean {
  try {
    return dialog.matches(':modal');
  } catch {
    return dialog.open; // without :modal support
  }
}

function addShortcut(p: KernCommandPalette) {
  if (typeof document === 'undefined' || shortcutPalettes.includes(p)) return;
  shortcutPalettes.push(p);
  if (shortcutPalettes.length === 1) document.addEventListener('keydown', onShortcut);
}

function removeShortcut(p: KernCommandPalette) {
  const i = shortcutPalettes.indexOf(p);
  if (i < 0) return;
  shortcutPalettes.splice(i, 1);
  if (!shortcutPalettes.length) document.removeEventListener('keydown', onShortcut);
}

/** The focused element, also inside shadow roots. */
function deepActiveElement(): HTMLElement | undefined {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return (el as HTMLElement | null) ?? undefined;
}

/**
 * Search field over pages, devices and actions in a modal (`kern-dialog`), to reach them by keyboard: «Boiler»,
 * «Updates», «Start scan». Open it with a button calling `show()`, by setting `open`, or with Ctrl+K / Cmd+K when
 * `shortcut` is set.
 *
 * Choosing an entry closes the palette and reports its `id` in `kernSelect`; navigating, permissions and running the
 * action stay with the app (dangerous actions go through its confirmation, e.g. `confirm()`). Disabled entries are
 * shown but cannot be chosen.
 *
 * By default the palette searches `items` itself: every word must occur in the label, a keyword or the group (case
 * and diacritics ignored); label matches rank first and are highlighted. With `filtering="external"` it shows `items`
 * as given: load results on `kernQueryChange` and set `items`, `loading` and `error`. Ignore answers to older queries
 * yourself (see the example), so a slow response cannot overwrite newer results.
 *
 * Keyboard: Arrow Up/Down, Home and End move the active entry, Enter chooses it, Escape (or a click on the backdrop)
 * closes. The focus is in the search field while open and returns to where it was (the button, a field) on close.
 * The number of results is announced politely once typing pauses («5 results»).
 *
 * `shortcut` registers one keydown listener on the document, removed with the last palette that uses it. Enable it
 * on one palette per page; with several, the open one closes and otherwise the last connected one opens. It does
 * not open while a modal dialog is open (kern-dialog, kern-drawer or a native one, also inside shadow roots), and
 * ignores keys an app handler already took (`preventDefault`).
 *
 * @part option - Each entry
 */
@Component({
  tag: 'kern-command-palette',
  styleUrl: 'kern-command-palette.css',
  shadow: true,
})
export class KernCommandPalette {
  @Element() el!: HTMLElement;

  /** Entries: `{ id, label, description?, group?, icon?, keywords?, disabled? }`. Groups appear in the order of their first entry. */
  @Prop() items: KernCommandItem[] = [];
  /** The search text; changes while typing and is cleared when the palette closes. */
  @Prop({ mutable: true }) query = '';
  /** `local`: the palette filters and ranks `items`. `external`: `items` are the results for `query` from your server. */
  @Prop() filtering: 'local' | 'external' = 'local';
  /** Results are loading: a spinner in the search field, and «Searching …» while there is nothing to show. */
  @Prop() loading = false;
  /** Message of a failed search; shown instead of the results. */
  @Prop() error?: string;
  /** Whether the palette is open. */
  @Prop({ mutable: true, reflect: true }) open = false;
  /** Ctrl+K / Cmd+K (with `shortcut-key`) opens and closes the palette from anywhere in the page. */
  @Prop() shortcut = false;
  /** Key pressed with Ctrl or Cmd for `shortcut`. */
  @Prop() shortcutKey = 'k';
  /** Accessible name of the dialog and the search field. */
  @Prop() label?: string;
  /** Placeholder of the search field. */
  @Prop() placeholder?: string;
  /** Shown while loading without results. */
  @Prop() labelLoading?: string;
  /** Heading when nothing matches. */
  @Prop() labelNoResults?: string;
  /** Announced number of results; `{n}` is replaced. */
  @Prop() labelResults?: string;
  /** Announced for exactly one result. */
  @Prop() labelOneResult?: string;
  private t = kernTexts(this, 'kern-command-palette');

  /** On every change of the search text by typing, and with `''` when closing clears it. Load results here (`filtering="external"`). */
  @Event() kernQueryChange!: EventEmitter<{ query: string }>;
  /** An enabled entry was chosen (Enter or click); the palette is already closed. */
  @Event() kernSelect!: EventEmitter<{ id: string }>;
  /** After the palette opened; the focus is in the search field. */
  @Event() kernOpen!: EventEmitter<void>;
  /** After the palette closed. */
  @Event() kernClose!: EventEmitter<void>;

  /** `id` of the active entry. */
  @State() activeId?: string;
  /** Text of the live region. */
  @State() announcement = '';

  private uid = `kern-command-palette-${nextId++}`;
  private dialog?: HTMLKernDialogElement;
  private input?: HTMLInputElement;
  private listbox?: HTMLElement;
  /** Focused element before opening; gets the focus back. */
  private returnTo?: HTMLElement;
  private announceTimer?: ReturnType<typeof setTimeout>;
  /**
   * Scrolling due after the next render: `active` brings the active entry into view, `top` first scrolls the list to
   * its start (the active entry was reset). Every change of the active entry sets it, except hovering.
   */
  private scrollPending: false | 'top' | 'active' = false;

  connectedCallback() {
    if (this.shortcut) addShortcut(this);
  }

  disconnectedCallback() {
    removeShortcut(this);
    clearTimeout(this.announceTimer);
  }

  componentDidLoad() {
    if (this.open) this.openChanged();
  }

  componentDidRender() {
    const pending = this.scrollPending;
    if (!pending || !this.listbox) return;
    this.scrollPending = false;
    if (pending === 'top') this.listbox.scrollTop = 0;
    this.listbox.querySelector<HTMLElement>('.option.active')?.scrollIntoView?.({ block: 'nearest' });
  }

  @Watch('shortcut')
  shortcutChanged() {
    if (this.shortcut) addShortcut(this);
    else removeShortcut(this);
  }

  @Watch('open')
  openChanged() {
    const d = this.dialog;
    if (!d) return;
    if (this.open) {
      if (d.open) return;
      this.returnTo = deepActiveElement();
      this.resetActive();
      this.announcement = '';
      d.open = true; // kern-dialog opens modally and emits kernOpen → onDialogOpen
      return;
    }
    clearTimeout(this.announceTimer);
    if (d.open) d.open = false;
    const to = this.returnTo;
    this.returnTo = undefined;
    if (to?.isConnected) to.focus({ preventScroll: true });
    if (this.query) {
      this.query = '';
      this.kernQueryChange.emit({ query: '' });
    }
  }

  @Watch('query')
  queryChanged() {
    this.resetActive();
    this.scheduleAnnounce();
  }

  @Watch('items')
  @Watch('filtering')
  @Watch('error')
  itemsChanged() {
    // Keep the active entry when it is still there (e.g. a status update), otherwise start at the top. An error
    // hides all entries; clearing it shows them again with the first one active.
    const hits = this.hits();
    if (hits.some((h) => h.item.id === this.activeId && !h.item.disabled)) this.scrollPending ||= 'active';
    else this.resetActive(hits);
    this.scheduleAnnounce();
  }

  @Watch('loading')
  loadingChanged() {
    this.scheduleAnnounce();
  }

  /** Opens the palette; the focus moves to the search field. */
  @Method()
  async show() {
    this.open = true;
  }

  /** Closes the palette; the focus returns to where it was before opening. */
  @Method()
  async hide() {
    this.open = false;
  }

  private groups(): CommandGroup[] {
    if (this.error) return [];
    return searchCommands(Array.isArray(this.items) ? this.items : [], this.query ?? '', this.filtering !== 'external');
  }

  /** Shown entries in display order. */
  private hits(): CommandHit[] {
    return this.groups().flatMap((g) => g.hits);
  }

  /** The first enabled entry becomes active, with the list scrolled back to the start. */
  private resetActive(hits = this.hits()) {
    this.activeId = this.firstEnabled(hits);
    this.scrollPending = 'top';
  }

  private firstEnabled(hits = this.hits()): string | undefined {
    return hits.find((h) => !h.item.disabled)?.item.id;
  }

  private move(key: string) {
    const enabled = this.hits().filter((h) => !h.item.disabled);
    if (!enabled.length) return;
    const last = enabled.length - 1;
    const at = enabled.findIndex((h) => h.item.id === this.activeId);
    const next: Record<string, number> = {
      ArrowDown: at < 0 ? 0 : Math.min(at + 1, last),
      ArrowUp: at < 0 ? last : Math.max(at - 1, 0),
      Home: 0,
      End: last,
    };
    this.activeId = enabled[next[key]].item.id;
    this.scrollPending = 'active';
  }

  private choose(hit?: CommandHit) {
    if (!hit || hit.item.disabled) return;
    this.open = false;
    this.kernSelect.emit({ id: hit.item.id });
  }

  /** Announces the number of results once typing and loading pause; nothing while the search field is empty. */
  private scheduleAnnounce() {
    if (!this.open) return;
    clearTimeout(this.announceTimer);
    this.announceTimer = setTimeout(() => {
      // An error announces itself (kern-empty-state is a live region).
      if (this.loading || this.error || !this.query.trim()) {
        this.announcement = '';
        return;
      }
      const n = this.hits().length;
      this.announcement = n === 0 ? this.t('labelNoResults') : n === 1 ? this.t('labelOneResult') : this.t('labelResults').replace('{n}', String(n));
    }, 600);
  }

  // ---------- events ----------

  private onDialogOpen = (ev: Event) => {
    ev.stopPropagation();
    this.input?.focus();
    // The list keeps its scroll position while closed: start at the top (also when nothing else re-renders).
    this.scrollPending = 'top';
    forceUpdate(this);
    this.kernOpen.emit();
  };

  private onDialogClose = (ev: Event) => {
    ev.stopPropagation();
    if (this.open) this.open = false;
    this.kernClose.emit();
  };

  /** On the whole dialog, so Escape closes wherever the focus is (and the native cancel never happens). */
  private onKeyDown = (ev: KeyboardEvent) => {
    if (ev.isComposing) return;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      this.open = false;
    } else if (ev.key === 'Enter' && ev.target === this.input) {
      ev.preventDefault();
      this.choose(this.hits().find((h) => h.item.id === this.activeId));
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(ev.key) && !(ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey)) {
      ev.preventDefault();
      this.move(ev.key);
    }
  };

  /** A click on the backdrop (outside the panel) closes. */
  private onDialogClick = (ev: MouseEvent) => {
    const target = ev.composedPath()[0] as HTMLElement | undefined;
    if (target?.localName !== 'dialog') return;
    const r = target.getBoundingClientRect();
    if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) this.open = false;
  };

  private onInput = (ev: Event) => {
    this.query = (ev.target as HTMLInputElement).value;
    this.kernQueryChange.emit({ query: this.query });
  };

  // ---------- render ----------

  private optionId(hit: CommandHit) {
    return `${this.uid}-opt-${hit.index}`;
  }

  /** The label with the matched parts in `<mark>`. */
  private marked(hit: CommandHit) {
    const label = hit.item.label ?? '';
    const out: (string | VNode)[] = [];
    let at = 0;
    for (const [a, b] of hit.ranges) {
      if (a > at) out.push(label.slice(at, a));
      out.push(<mark>{label.slice(a, b)}</mark>);
      at = b;
    }
    if (at < label.length) out.push(label.slice(at));
    return out;
  }

  private renderOption(hit: CommandHit) {
    const { item } = hit;
    const id = this.optionId(hit);
    const active = item.id === this.activeId;
    return (
      <div
        id={id}
        class={{ option: true, active }}
        part="option"
        role="option"
        aria-selected={active ? 'true' : 'false'}
        aria-disabled={item.disabled ? 'true' : undefined}
        aria-labelledby={`${id}-label`}
        aria-describedby={item.description ? `${id}-desc` : undefined}
        onPointerMove={() => {
          if (!item.disabled && !active) this.activeId = item.id;
        }}
        onClick={() => this.choose(hit)}
      >
        {item.icon && <kern-icon name={item.icon} class="option-icon" />}
        <span class="text">
          <span class="label" id={`${id}-label`}>
            {this.marked(hit)}
          </span>
          {item.description && (
            <span class="description" id={`${id}-desc`}>
              {item.description}
            </span>
          )}
        </span>
      </div>
    );
  }

  render() {
    const groups = this.groups();
    const hits = groups.flatMap((g) => g.hits);
    const listId = `${this.uid}-list`;
    const active = hits.find((h) => h.item.id === this.activeId);
    const empty = !hits.length && !this.error;
    return (
      <Host>
        <kern-dialog
          ref={(el) => (this.dialog = el)}
          label={this.t('label')}
          dismissible={false}
          width={640}
          onKernOpen={this.onDialogOpen}
          onKernClose={this.onDialogClose}
          onKeyDown={this.onKeyDown}
          onClick={this.onDialogClick}
        >
          <div class="palette">
            <div class="sr" role="status">
              {this.announcement}
            </div>
            <div class="search">
              <Icon name="search" class="search-icon" />
              <input
                ref={(el) => (this.input = el)}
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={hits.length ? 'true' : 'false'}
                aria-controls={listId}
                aria-activedescendant={active ? this.optionId(active) : undefined}
                aria-label={this.t('label')}
                placeholder={this.t('placeholder')}
                autocomplete="off"
                spellcheck={false}
                enterKeyHint="go"
                value={this.query}
                onInput={this.onInput}
              />
              {this.loading && <kern-spinner class="spinner" />}
            </div>
            <div
              ref={(el) => (this.listbox = el)}
              id={listId}
              class="listbox"
              role="listbox"
              aria-label={this.t('label')}
              aria-busy={this.loading ? 'true' : undefined}
              hidden={!hits.length}
              // The focus stays in the search field.
              onPointerDown={(ev) => ev.preventDefault()}
            >
              {groups.map((g, gi) =>
                g.label ? (
                  <div role="group" class="group" aria-labelledby={`${this.uid}-group-${gi}`}>
                    <div class="group-label" id={`${this.uid}-group-${gi}`} role="presentation">
                      {g.label}
                    </div>
                    {g.hits.map((hit) => this.renderOption(hit))}
                  </div>
                ) : (
                  g.hits.map((hit) => this.renderOption(hit))
                ),
              )}
            </div>
            {empty && this.loading && <div class="state loading">{this.t('labelLoading')}</div>}
            {empty && !this.loading && !!this.query.trim() && <kern-empty-state class="state" variant="no-results" compact heading={this.t('labelNoResults')} />}
            {this.error && (
              <kern-empty-state class="state" variant="error" compact>
                {this.error}
              </kern-empty-state>
            )}
          </div>
        </kern-dialog>
      </Host>
    );
  }
}
