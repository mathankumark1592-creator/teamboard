import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface BarDatum {
  label: string;
  value: number;
  color: string;
}

/** Dependency-free horizontal bar chart (pure CSS), accessible via a text table fallback. */
@Component({
  selector: 'app-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart" role="img" [attr.aria-label]="summary()">
      @for (d of data(); track d.label) {
        <div class="row">
          <span class="label">{{ d.label }}</span>
          <div class="track">
            <div class="bar" [style.width.%]="pct(d.value)" [style.background]="d.color"></div>
          </div>
          <span class="value">{{ d.value }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .chart { display: grid; gap: 10px; }
    .row { display: grid; grid-template-columns: 100px 1fr 32px; align-items: center; gap: 10px; font-size: 0.85rem; }
    .track { background: #eef0f6; border-radius: 6px; height: 14px; overflow: hidden; }
    .bar { height: 100%; border-radius: 6px; transition: width 0.4s ease; }
    .value { text-align: right; font-weight: 600; }
    .label { color: #646b80; }
  `,
})
export class BarChart {
  readonly data = input.required<BarDatum[]>();

  private readonly max = computed(() => Math.max(1, ...this.data().map((d) => d.value)));
  protected readonly summary = computed(() => this.data().map((d) => `${d.label}: ${d.value}`).join(', '));

  protected pct(value: number): number {
    return (value / this.max()) * 100;
  }
}
