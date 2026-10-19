import { Component, Host, Prop, h } from '@stencil/core';

/**
 * Placeholder in the shape of content that is still loading, so the layout does not jump. `text` draws lines (the last
 * one shorter), `block` a rectangle (cards, stats, charts), `circle` an avatar or status dot. Hidden from assistive
 * technology; mark the loading container with `aria-busy="true"` instead.
 */
@Component({
  tag: 'kern-skeleton',
  styleUrl: 'kern-skeleton.css',
  shadow: true,
})
export class KernSkeleton {
  @Prop({ reflect: true }) variant: 'text' | 'block' | 'circle' = 'text';
  /** Number of lines (text). */
  @Prop() lines = 1;
  /** Width, e.g. `120px` or `60%` (text and block; default 100%). */
  @Prop() width?: string;
  /** Height of a block, e.g. `80px`. */
  @Prop() height?: string;
  /** Diameter of a circle, e.g. `32px`. */
  @Prop() size = '32px';

  render() {
    const style = this.variant === 'circle' ? { width: this.size, height: this.size } : { width: this.width, height: this.variant === 'block' ? (this.height ?? '80px') : undefined };
    return (
      <Host aria-hidden="true" style={style}>
        {this.variant === 'text' ? (
          Array.from({ length: Math.max(1, this.lines) }, (_, i) => <span class={{ bone: true, line: true, last: i > 0 && i === this.lines - 1 }} />)
        ) : (
          <span class="bone" />
        )}
      </Host>
    );
  }
}
