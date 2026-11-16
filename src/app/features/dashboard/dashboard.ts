import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { TaskService } from '../../core/task.service';
import { UserService } from '../../core/user.service';
import { BarChart, BarDatum } from '../../shared/bar-chart';

@Component({
  selector: 'app-dashboard',
  imports: [BarChart, RouterLink],
  template: `
    <div class="page-head">
      <div>
        <h1>Welcome back, {{ firstName() }}</h1>
        <p class="muted">
          @if (auth.role() === 'staff') { Your assigned work at a glance. }
          @else { Team workload at a glance. }
        </p>
      </div>
      <a class="btn" routerLink="/tasks">View tasks</a>
    </div>

    <section class="stats" aria-label="Summary">
      @for (s of cards(); track s.label) {
        <div class="card stat">
          <span class="muted">{{ s.label }}</span>
          <strong [class.overdue]="s.warn && s.value > 0">{{ s.value }}</strong>
        </div>
      }
    </section>

    <div class="grid">
      <section class="card">
        <h2>Tasks by status</h2>
        <app-bar-chart [data]="statusData()" />
      </section>
      <section class="card">
        <h2>Open tasks per person</h2>
        <app-bar-chart [data]="workloadData()" />
      </section>
    </div>
  `,
  styles: `
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .stat { display: grid; gap: 4px; }
    .stat strong { font-size: 1.8rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
  `,
})
export class DashboardPage {
  protected readonly auth = inject(AuthService);
  private readonly tasks = inject(TaskService);
  private readonly users = inject(UserService);

  protected readonly firstName = computed(() => this.auth.user()?.name.split(' ')[0] ?? '');

  protected readonly cards = computed(() => {
    const s = this.tasks.stats();
    return [
      { label: 'Total tasks', value: s.total, warn: false },
      { label: 'In progress', value: s.inProgress, warn: false },
      { label: 'Completed', value: s.done, warn: false },
      { label: 'Overdue', value: s.overdue, warn: true },
    ];
  });

  protected readonly statusData = computed<BarDatum[]>(() => {
    const s = this.tasks.stats();
    return [
      { label: 'To do', value: s.todo, color: '#9aa3b8' },
      { label: 'In progress', value: s.inProgress, color: '#d97706' },
      { label: 'Done', value: s.done, color: '#16a34a' },
    ];
  });

  protected readonly workloadData = computed<BarDatum[]>(() => {
    const open = this.tasks.tasks().filter((t) => t.status !== 'done');
    const byUser = new Map<number, number>();
    open.forEach((t) => byUser.set(t.assigneeId, (byUser.get(t.assigneeId) ?? 0) + 1));
    return [...byUser.entries()]
      .map(([id, value]) => ({ label: this.users.nameOf(id).split(' ')[0], value, color: '#4f46e5' }))
      .sort((a, b) => b.value - a.value);
  });
}
