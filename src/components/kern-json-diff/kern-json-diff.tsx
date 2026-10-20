import { Component, Host, Prop, h } from '@stencil/core';
import { diffJson, KernJsonDiffEntry, KernJsonDiffKind } from '../../utils/json-diff';
import { kernTexts } from '../../utils/i18n';

const TONE: Record<KernJsonDiffKind, 'ok' | 'danger' | 'warn'> = { added: 'ok', removed: 'danger', changed: 'warn' };

/**
 * Differences between two states of the same JSON (config before/after, target/actual, two firmware versions): one
 * table row per changed, added or removed path, with a summary line above. Uses `diffJson()`, which is exported too.
 */
@Component({
  tag: 'kern-json-diff',
  styleUrl: 'kern-json-diff.css',
  shadow: true,
})
export class KernJsonDiff {
  /** The earlier state (object, array or primitive). A string is parsed as JSON when possible. */
  @Prop() from?: unknown;
  /** The later state. A string is parsed as JSON when possible. */
  @Prop() to?: unknown;
  /** Paths that do not count, as an array or comma-separated (`time,unixtime,sys.uptime`). A path ignores everything below it. */
  @Prop() ignore: string[] | string = [];
  /** Longer values are cut with „…“; the whole value is in the tooltip. */
  @Prop() maxValueLength = 80;
  /** Header of the column with the earlier value, e.g. the time of the snapshot. */
  @Prop() labelBefore?: string;
  @Prop() labelAfter?: string;
  @Prop() labelPath?: string;
  @Prop() labelKind?: string;
  @Prop() labelAdded?: string;
  @Prop() labelRemoved?: string;
  @Prop() labelChanged?: string;
  @Prop() labelNone?: string;
  /** `{n}`, `{changed}`, `{added}` and `{removed}` are replaced. */
  @Prop() labelSummary?: string;
  private t = kernTexts(this, 'kern-json-diff');

  private parse(v: unknown): unknown {
    if (typeof v !== 'string') return v;
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }

  private get paths(): string[] {
    const v = this.ignore;
    return (Array.isArray(v) ? v : String(v ?? '').split(',')).map((s) => String(s).trim()).filter(Boolean);
  }

  private value(v: unknown, present: boolean) {
    if (!present) return <td class="value none">–</td>;
    const full = v === undefined ? 'undefined' : JSON.stringify(v);
    const max = Math.max(1, this.maxValueLength);
    const cut = full.length > max;
    return (
      <td class="value" title={cut ? full : undefined}>
        {cut ? `${full.slice(0, max - 1)}…` : full}
      </td>
    );
  }

  private row(d: KernJsonDiffEntry) {
    const label = { added: this.t('labelAdded'), removed: this.t('labelRemoved'), changed: this.t('labelChanged') }[d.kind];
    return (
      <tr class={d.kind}>
        <td class="path">{d.path || '(root)'}</td>
        {this.value(d.before, d.kind !== 'added')}
        {this.value(d.after, d.kind !== 'removed')}
        <td class="kind">
          <kern-badge tone={TONE[d.kind]}>{label}</kern-badge>
        </td>
      </tr>
    );
  }

  render() {
    const list = diffJson(this.parse(this.from), this.parse(this.to), { ignore: this.paths });
    const count = (k: KernJsonDiffKind) => list.filter((d) => d.kind === k).length;
    const summary = list.length
      ? this.t('labelSummary')
          .replace('{n}', String(list.length))
          .replace('{changed}', String(count('changed')))
          .replace('{added}', String(count('added')))
          .replace('{removed}', String(count('removed')))
      : this.t('labelNone');
    return (
      <Host>
        <div class="summary" role="status">
          {summary}
        </div>
        {list.length > 0 && (
          <div class="frame">
            <table>
              <thead>
                <tr>
                  <th>{this.t('labelPath')}</th>
                  <th>{this.t('labelBefore')}</th>
                  <th>{this.t('labelAfter')}</th>
                  <th>{this.t('labelKind')}</th>
                </tr>
              </thead>
              <tbody>{list.map((d) => this.row(d))}</tbody>
            </table>
          </div>
        )}
      </Host>
    );
  }
}
