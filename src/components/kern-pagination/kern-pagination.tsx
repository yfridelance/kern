import { Component, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { resolveLocale } from '../../utils/datetime';
import { pageItems } from './pages';
import { kernTexts } from '../../utils/i18n';

/**
 * Paging for long tables and lists: range („1–25 von 380“), optional page size, first/previous, page numbers with
 * „…“, next/last. Emits `kernPageChange`; the app loads the page. Changing the page size keeps the first visible
 * item on screen.
 */
@Component({
  tag: 'kern-pagination',
  styleUrl: 'kern-pagination.css',
  shadow: true,
})
export class KernPagination {
  /** Number of items. */
  @Prop() total = 0;
  /** Current page, from 1. */
  @Prop({ mutable: true }) page = 1;
  @Prop({ mutable: true }) pageSize = 25;
  /** Offered page sizes, e.g. `10,25,50,100`; empty hides the choice. */
  @Prop() pageSizes: number[] | string = '';
  /** Page numbers on each side of the current one. */
  @Prop() siblings = 1;
  /** BCP 47 locale for numbers; defaults to `<html lang>`, then the browser language. */
  @Prop() locale?: string;
  @Prop() label?: string;
  /** `{from}`, `{to}` and `{total}` are replaced. */
  @Prop() labelRange?: string;
  @Prop() labelPageSize?: string;
  /** `{n}` is replaced. */
  @Prop() labelPage?: string;
  @Prop() labelFirst?: string;
  @Prop() labelPrevious?: string;
  @Prop() labelNext?: string;
  @Prop() labelLast?: string;
  private t = kernTexts(this, 'kern-pagination');

  /** The page or page size changed. */
  @Event() kernPageChange!: EventEmitter<{ page: number; pageSize: number }>;

  private get count(): number {
    return Math.max(1, Math.ceil(this.total / Math.max(1, this.pageSize)));
  }

  private get sizes(): number[] {
    const v = this.pageSizes;
    const list = Array.isArray(v) ? v : String(v ?? '').split(',');
    return list.map((n) => Number(n)).filter((n) => n > 0);
  }

  @Watch('total')
  @Watch('pageSize')
  clamp() {
    if (this.page > this.count) this.page = this.count;
    if (this.page < 1) this.page = 1;
  }

  componentWillLoad() {
    this.clamp();
  }

  private go(page: number) {
    const p = Math.max(1, Math.min(this.count, page));
    if (p === this.page) return;
    this.page = p;
    this.kernPageChange.emit({ page: p, pageSize: this.pageSize });
  }

  private onSize = (ev: CustomEvent<{ value: string | string[] }>) => {
    ev.stopPropagation();
    const size = Number(ev.detail.value);
    if (!size || size === this.pageSize) return;
    const firstItem = (this.page - 1) * this.pageSize;
    this.pageSize = size;
    this.page = Math.floor(firstItem / size) + 1;
    this.kernPageChange.emit({ page: this.page, pageSize: size });
  };

  render() {
    const fmt = new Intl.NumberFormat(resolveLocale(this.locale));
    const from = this.total ? (this.page - 1) * this.pageSize + 1 : 0;
    const to = Math.min(this.total, this.page * this.pageSize);
    const range = this.t('labelRange').replace('{from}', fmt.format(from)).replace('{to}', fmt.format(to)).replace('{total}', fmt.format(this.total));
    const first = this.page <= 1;
    const last = this.page >= this.count;
    const sizes = this.sizes;
    const nav = (cls: string, label: string, target: number, disabled: boolean, icon: 'chevron-left' | 'chevron-right', double = false) => (
      <button type="button" class={`nav ${cls}`} aria-label={label} title={label} disabled={disabled} onClick={() => this.go(target)}>
        <Icon name={icon} />
        {double && <Icon name={icon} class="second" />}
      </button>
    );
    return (
      <Host>
        <nav aria-label={this.t('label')}>
          <span class="range" aria-live="polite">
            {range}
          </span>
          {sizes.length > 0 && (
            <span class="size">
              <span class="size-label">{this.t('labelPageSize')}</span>
              <kern-select size="sm" aria-label-text={this.t('labelPageSize')} value={String(this.pageSize)} options={sizes.map((n) => ({ value: String(n), label: fmt.format(n) }))} onKernChange={this.onSize} />
            </span>
          )}
          <span class="pages">
            {nav('first', this.t('labelFirst'), 1, first, 'chevron-left', true)}
            {nav('prev', this.t('labelPrevious'), this.page - 1, first, 'chevron-left')}
            {pageItems(this.page, this.count, this.siblings).map((p) =>
              p === '…' ? (
                <span class="gap" aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  type="button"
                  class={{ num: true, current: p === this.page }}
                  aria-label={this.t('labelPage').replace('{n}', String(p))}
                  aria-current={p === this.page ? 'page' : undefined}
                  onClick={() => this.go(p)}
                >
                  {fmt.format(p)}
                </button>
              ),
            )}
            {nav('next', this.t('labelNext'), this.page + 1, last, 'chevron-right')}
            {nav('last', this.t('labelLast'), this.count, last, 'chevron-right', true)}
          </span>
        </nav>
      </Host>
    );
  }
}
