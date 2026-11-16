import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { buildSeedTasks } from './mock-data';
import { Task, TaskStatus } from './models';

export type TaskInput = Omit<Task, 'id'>;

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isOverdue(task: Task, today = todayIso()): boolean {
  return task.status !== 'done' && task.dueDate < today;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly auth = inject(AuthService);
  private readonly all = signal<Task[]>(buildSeedTasks());
  private nextId = this.all().length + 1;

  /** Role-based visibility: staff only see tasks assigned to them. */
  readonly tasks = computed(() => {
    const user = this.auth.user();
    if (!user) return [];
    return user.role === 'staff' ? this.all().filter((t) => t.assigneeId === user.id) : this.all();
  });

  readonly stats = computed(() => {
    const list = this.tasks();
    return {
      total: list.length,
      todo: list.filter((t) => t.status === 'todo').length,
      inProgress: list.filter((t) => t.status === 'in-progress').length,
      done: list.filter((t) => t.status === 'done').length,
      overdue: list.filter((t) => isOverdue(t)).length,
    };
  });

  add(input: TaskInput): void {
    this.all.update((list) => [...list, { ...input, id: this.nextId++ }]);
  }

  update(id: number, input: TaskInput): void {
    this.all.update((list) => list.map((t) => (t.id === id ? { ...input, id } : t)));
  }

  setStatus(id: number, status: TaskStatus): void {
    this.all.update((list) => list.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  remove(id: number): void {
    this.all.update((list) => list.filter((t) => t.id !== id));
  }
}
