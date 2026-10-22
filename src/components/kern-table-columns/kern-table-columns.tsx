import { Component, Element, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { kernTexts } from '../../utils/i18n';
import { resolveColumnState, type KernColumnState } from '../kern-table/columns';
import type { KernTableColumn } from '../kern-table/sort';

/**
 * Column chooser for a `kern-table` in data mode: a checkbox per column to show or hide it and buttons to move it up
 * or down (also Alt+↑/↓ in its row). Pinned columns are marked and move within their group. It edits a column state
 * and reports it with `kernColumnsChange`; the app sets it on the table (`table.columnState = e.detail.state`) and
 * stores it if it wants. Put it in a `kern-drawer`, a dialog or a panel next to the table.
 */
@Component({
  tag: 'kern-table-columns',
  styleUrl: 'kern-table-columns.css',
  shadow: true,
})
export class KernTableColumns {
  @Element() el!: HTMLElement;

  /** The table's columns (`key`, `label`, `hideable`, default `hidden` and `pinned`). */
  @Prop() columns: KernTableColumn[] = [];
  /** The column state shown; changed by the user unless `kernColumnsChange` is cancelled. Default: from `columns`. */
  @Prop({ mutable: true }) columnState?: KernColumnState[];
  /** At least this many columns stay visible: their checkboxes can't be cleared. */
  @Prop() minVisibleColumns = 1;
  /** Accessible name of the list. */
  @Prop() label?: string;
  /** Accessible name of a move-up button; `{label}` is the column. */
  @Prop() labelMoveUp?: string;
  /** Accessible name of a move-down button; `{label}` is the column. */
  @Prop() labelMoveDown?: string;
  /** Mark of a column pinned to the start. */
  @Prop() labelPinnedStart?: string;
  /** Mark of a column pinned to the end. */
  @Prop() labelPinnedEnd?: string;
  /** Announced after a move; `{label}`, `{position}` and `{count}` are replaced. */
  @Prop() labelMoved?: string;

  /** A column was shown, hidden or moved. `state` is the complete new column state. Cancelable: `preventDefault()` keeps it as it is. */
  @Event({ cancelable: true }) kernColumnsChange!: EventEmitter<{ state: KernColumnState[] }>;

  /** Text for the live region after a move. */
  @State() announcement = '';

  private t = kernTexts(this, 'kern-table-columns');
  /** After a move: the button that keeps focus (by column key and direction). */
  private refocus?: { key: string; dir: -1 | 1 };

  private state(): KernColumnState[] {
    return resolveColumnState(this.columns ?? [], this.columnState, this.min());
  }

  private min() {
    return Math.max(0, Number(this.minVisibleColumns) || 0);
  }

  private labelOf(key: string) {
    return this.columns.find((c) => c.key === key)?.label ?? key;
  }

  /** Emits the new state and takes it unless cancelled. */
  private commit(next: KernColumnState[]): boolean {
    const state = resolveColumnState(this.columns ?? [], next, this.min());
    if (this.kernColumnsChange.emit({ state }).defaultPrevented) return false;
    this.columnState = state;
    return true;
  }

  private toggle(key: string, ev: CustomEvent<{ checked: boolean }>) {
    ev.stopPropagation(); // the change is reported as kernColumnsChange, not as the checkbox's
    const next = this.state().map((s) => (s.key === key ? { ...s, hidden: !ev.detail.checked } : s));
    if (!this.commit(next)) (ev.target as HTMLInputElement).checked = !ev.detail.checked;
  }

  /** Moves a column one place within its pin group. */
  private move(key: string, dir: -1 | 1) {
    const state = this.state();
    const i = state.findIndex((s) => s.key === key);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= state.length || state[j].pinned !== state[i].pinned) return;
    const next = [...state];
    [next[i], next[j]] = [next[j], next[i]];
    if (!this.commit(next)) return;
    this.refocus = { key, dir };
    this.announcement = this.t('labelMoved')
      .replace('{label}', this.labelOf(key))
      .replace('{position}', String(j + 1))
      .replace('{count}', String(state.length));
  }

  private onKey(key: string, ev: KeyboardEvent) {
    if (!ev.altKey || (ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown')) return;
    ev.preventDefault();
    this.move(key, ev.key === 'ArrowUp' ? -1 : 1);
  }

  componentDidRender() {
    const target = this.refocus;
    if (!target) return;
    this.refocus = undefined;
    const row = Array.from(this.el.shadowRoot?.querySelectorAll('li') ?? []).find((li) => li.getAttribute('data-key') === target.key);
    // The button pressed, or the other one when the column reached the end of its group.
    const buttons = Array.from(row?.querySelectorAll('button') ?? []) as HTMLButtonElement[];
    const pressed = buttons[target.dir < 0 ? 0 : 1];
    const focused = this.el.shadowRoot?.activeElement;
    // Alt+↑/↓ on the checkbox: focus stays there.
    if (focused && row?.contains(focused) && focused.localName === 'kern-checkbox') return;
    (pressed && !pressed.disabled ? pressed : buttons.find((b) => !b.disabled))?.focus();
  }

  render() {
    const state = this.state();
    const visible = state.filter((s) => !s.hidden).length;
    return (
      <Host>
        <ul aria-label={this.t('label')}>
          {state.map((s, i) => {
            const column = this.columns.find((c) => c.key === s.key)!;
            const label = column.label;
            const fixed = column.hideable === false || (!s.hidden && visible <= this.min());
            const first = i === 0 || state[i - 1].pinned !== s.pinned;
            const last = i === state.length - 1 || state[i + 1].pinned !== s.pinned;
            const up = this.t('labelMoveUp').replace('{label}', label);
            const down = this.t('labelMoveDown').replace('{label}', label);
            return (
              <li key={s.key} data-key={s.key} onKeyDown={(ev) => this.onKey(s.key, ev)}>
                <kern-checkbox class="show" checked={!s.hidden} disabled={fixed} onKernChange={(ev) => this.toggle(s.key, ev)}>
                  {label}
                </kern-checkbox>
                {s.pinned && <span class="pin">{this.t(s.pinned === 'start' ? 'labelPinnedStart' : 'labelPinnedEnd')}</span>}
                <span class="move">
                  <button type="button" aria-label={up} title={up} disabled={first} onClick={() => this.move(s.key, -1)}>
                    <Icon name="chevron-up" />
                  </button>
                  <button type="button" aria-label={down} title={down} disabled={last} onClick={() => this.move(s.key, 1)}>
                    <Icon name="chevron-down" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
        <span class="live" role="status">
          {this.announcement}
        </span>
      </Host>
    );
  }
}
