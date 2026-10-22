import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { fieldDisabled } from '../../utils/form-disabled';
import { Icon } from '../../utils/icons';
import { resolveLocale } from '../../utils/datetime';
import { accepts, formatSize, parseSize } from '../../utils/files';
import { kernTexts } from '../../utils/i18n';

interface Rejected {
  reason: 'labelWrongType' | 'labelTooLarge';
  name: string;
  max: number;
}

let nextId = 0;

/**
 * File picker with drop zone (firmware, configuration import), form-associated. Checks `accept` and `max-size`;
 * rejected files are named in the message and not added. The chosen files are listed with size and ×; with `multiple`
 * new files are added, otherwise they replace the previous one. The form gets the files under `name`.
 *
 * @part dropzone - The drop zone
 */
@Component({
  tag: 'kern-file-input',
  styleUrl: 'kern-file-input.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernFileInput {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  @Prop() name?: string;
  /** Like the native attribute: `.bin,.json`, `image/*`, `application/pdf`. */
  @Prop() accept?: string;
  @Prop() multiple = false;
  /** Largest file, in bytes or as `"16MB"`, `"500KB"`. */
  @Prop() maxSize?: number | string;
  /** The chosen files; set `[]` to clear. */
  @Prop({ mutable: true }) files: File[] = [];
  @Prop({ reflect: true }) disabled = false;
  /** Set by a disabled fieldset or form; `disabled` stays the author's own. */
  @State() formDisabled = false;
  @Prop() required = false;
  /** BCP 47 locale for sizes; defaults to `<html lang>`, then the browser language. */
  @Prop() locale?: string;
  @Prop() labelChoose?: string;
  @Prop() labelChooseMultiple?: string;
  @Prop() labelDrop?: string;
  /** `{name}` is replaced. */
  @Prop() labelRemove?: string;
  /** `{name}` and `{max}` are replaced. */
  @Prop() labelTooLarge?: string;
  /** `{name}` is replaced. */
  @Prop() labelWrongType?: string;
  private t = kernTexts(this, 'kern-file-input', 'sync');

  /** When files were added or removed. */
  @Event() kernChange!: EventEmitter<{ files: File[] }>;

  @State() over = false;
  /** Rejected files with the reason, until the next change; turned into messages in the current language. */
  @State() problems: Rejected[] = [];

  private input?: HTMLInputElement;
  private chooser?: HTMLButtonElement;
  private uid = `kern-file-input-${++nextId}`;
  private depth = 0;

  componentDidLoad() {
    this.sync();
  }

  @Watch('files')
  @Watch('error')
  @Watch('required')
  @Watch('problems')
  sync() {
    let data: FormData | null = null;
    if (this.name && this.files.length && typeof FormData !== 'undefined') {
      data = new FormData();
      this.files.forEach((f) => data!.append(this.name!, f));
    }
    this.internals?.setFormValue?.(data);
    const message = this.error ?? this.messages()[0];
    if (message) this.internals?.setValidity?.({ customError: true }, message, this.chooser);
    else if (this.required && !this.files.length) this.internals?.setValidity?.({ valueMissing: true }, 'required', this.chooser);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.files = [];
    this.problems = [];
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
  }

  /** Opens the file dialog. */
  @Method()
  async open() {
    if (!fieldDisabled(this)) this.input?.click();
  }

  /** Check and add files (also used for drops). */
  @Method()
  async addFiles(list: FileList | File[]) {
    const max = parseSize(this.maxSize);
    const problems: Rejected[] = [];
    const ok: File[] = [];
    for (const f of Array.from(list)) {
      if (!accepts(f, this.accept)) problems.push({ reason: 'labelWrongType', name: f.name, max: 0 });
      else if (max !== null && f.size > max) problems.push({ reason: 'labelTooLarge', name: f.name, max });
      else ok.push(f);
    }
    this.problems = problems;
    if (!ok.length) return;
    const same = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
    this.files = this.multiple ? [...this.files, ...ok.filter((f) => !this.files.some((g) => same(f, g)))] : [ok[0]];
    this.kernChange.emit({ files: this.files });
  }

  /** Messages for the rejected files in the current language. */
  private messages(): string[] {
    const loc = resolveLocale(this.locale);
    return this.problems.map((p) => this.t(p.reason).replace('{name}', p.name).replace('{max}', formatSize(p.max, loc)));
  }

  private removeFile(i: number) {
    this.files = this.files.filter((_, n) => n !== i);
    this.problems = [];
    this.kernChange.emit({ files: this.files });
    this.chooser?.focus();
  }

  private onPick = (ev: Event) => {
    const input = ev.target as HTMLInputElement;
    if (input.files) this.addFiles(input.files);
    input.value = ''; // picking the same file again fires change again
  };

  private onDragEnter = (ev: DragEvent) => {
    if (fieldDisabled(this) || !ev.dataTransfer?.types?.includes('Files')) return;
    ev.preventDefault();
    this.depth++;
    this.over = true;
  };

  private onDragOver = (ev: DragEvent) => {
    if (fieldDisabled(this) || !this.over) return;
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'copy';
  };

  private onDragLeave = () => {
    this.depth = Math.max(0, this.depth - 1);
    if (!this.depth) this.over = false;
  };

  private onDrop = (ev: DragEvent) => {
    if (fieldDisabled(this)) return;
    ev.preventDefault();
    this.depth = 0;
    this.over = false;
    if (ev.dataTransfer?.files?.length) this.addFiles(this.multiple ? ev.dataTransfer.files : [ev.dataTransfer.files[0]]);
  };

  render() {
    const message = this.error ?? this.messages().join(' ');
    const describedBy = message ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    const loc = resolveLocale(this.locale);
    return (
      <Host invalid={!!message}>
        {this.label && (
          <label class="label" htmlFor={this.uid}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        <div
          class={{ dropzone: true, over: this.over, disabled: fieldDisabled(this) }}
          part="dropzone"
          onDragEnter={this.onDragEnter}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDrop={this.onDrop}
        >
          <Icon name="upload" class="upload" />
          <span class="prompt">
            <button
              ref={(el) => (this.chooser = el)}
              id={this.uid}
              type="button"
              class="choose"
              disabled={fieldDisabled(this)}
              onClick={() => this.open()}
              aria-describedby={describedBy}
            >
              {this.multiple ? this.t('labelChooseMultiple') : this.t('labelChoose')}
            </button>{' '}
            <span class="drop">{this.t('labelDrop')}</span>
          </span>
          {(this.accept || this.maxSize) && (
            <span class="limits">{[this.accept?.split(',').map((a) => a.trim()).join(', '), parseSize(this.maxSize) ? `max. ${formatSize(parseSize(this.maxSize)!, loc)}` : ''].filter(Boolean).join(' · ')}</span>
          )}
          <input
            ref={(el) => (this.input = el)}
            class="native"
            type="file"
            tabindex={-1}
            accept={this.accept}
            multiple={this.multiple}
            disabled={fieldDisabled(this)}
            aria-hidden="true"
            onChange={this.onPick}
          />
        </div>
        {this.files.length > 0 && (
          <ul class="files" aria-label={this.label}>
            {this.files.map((f, i) => (
              <li>
                <span class="name">{f.name}</span>
                <span class="size">{formatSize(f.size, loc)}</span>
                <button
                  type="button"
                  class="remove"
                  aria-label={this.t('labelRemove').replace('{name}', f.name)}
                  title={this.t('labelRemove').replace('{name}', f.name)}
                  disabled={fieldDisabled(this)}
                  onClick={() => this.removeFile(i)}
                >
                  <Icon name="close" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {message ? (
          <span class="error" id={`${this.uid}-error`} role="alert">
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
