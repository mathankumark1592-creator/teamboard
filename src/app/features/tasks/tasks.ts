import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Priority, STATUS_LABELS, Task, TaskStatus } from '../../core/models';
import { TaskService, isOverdue, todayIso } from '../../core/task.service';
import { UserService } from '../../core/user.service';
import { SortKey, applyQuery } from './task-query';

@Component({
  selector: 'app-tasks',
  imports: [ReactiveFormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class TasksPage {
  private readonly fb = inject(FormBuilder);
  private readonly tasks = inject(TaskService);
  private readonly users = inject(UserService);
  protected readonly auth = inject(AuthService);

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statusOptions: TaskStatus[] = ['todo', 'in-progress', 'done'];
  protected readonly priorities: Priority[] = ['low', 'medium', 'high'];

  /** Only admins and managers can create, edit or delete. */
  protected readonly canManage = computed(() => this.auth.hasRole('admin', 'manager'));
  protected readonly assignees = computed(() => this.users.users().filter((u) => u.active));

  // --- table state (signals) ---
  protected readonly search = signal('');
  protected readonly status = signal<TaskStatus | 'all'>('all');
  protected readonly sortKey = signal<SortKey>('dueDate');
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');
  protected readonly page = signal(1);
  protected readonly pageSize = 8;

  protected readonly result = computed(() =>
    applyQuery(
      this.tasks.tasks(),
      {
        search: this.search(),
        status: this.status(),
        sortKey: this.sortKey(),
        sortDir: this.sortDir(),
        page: this.page(),
        pageSize: this.pageSize,
      },
      (id) => this.users.nameOf(id),
    ),
  );

  // --- form state ---
  protected readonly editing = signal<Task | 'new' | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    description: ['', Validators.maxLength(300)],
    status: ['todo' as TaskStatus, Validators.required],
    priority: ['medium' as Priority, Validators.required],
    assigneeId: [0, [Validators.required, Validators.min(1)]],
    dueDate: [todayIso(), Validators.required],
  });

  protected name(id: number): string {
    return this.users.nameOf(id);
  }

  protected overdue(t: Task): boolean {
    return isOverdue(t);
  }

  protected setSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  protected setStatus(value: string): void {
    this.status.set(value as TaskStatus | 'all');
    this.page.set(1);
  }

  protected sortBy(key: SortKey): void {
    if (this.sortKey() === key) this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  protected ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== key) return 'none';
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  protected go(delta: number): void {
    this.page.set(this.result().page + delta);
  }

  protected changeStatus(t: Task, value: string): void {
    this.tasks.setStatus(t.id, value as TaskStatus);
  }

  protected openNew(): void {
    this.form.reset({ title: '', description: '', status: 'todo', priority: 'medium', assigneeId: 0, dueDate: todayIso() });
    this.editing.set('new');
  }

  protected openEdit(t: Task): void {
    const { id: _id, ...rest } = t;
    this.form.reset(rest);
    this.editing.set(t);
  }

  protected cancel(): void {
    this.editing.set(null);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const current = this.editing();
    if (current === 'new') this.tasks.add(value);
    else if (current) this.tasks.update(current.id, value);
    this.editing.set(null);
  }

  protected remove(t: Task): void {
    if (confirm(`Delete "${t.title}"?`)) this.tasks.remove(t.id);
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }
}
