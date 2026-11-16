import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { DEMO_CREDENTIALS } from './mock-data';
import { Task } from './models';
import { TaskService, isOverdue } from './task.service';

const userOf = (role: 'admin' | 'staff') => DEMO_CREDENTIALS.find((c) => c.user.role === role)!.user;

describe('TaskService', () => {
  let auth: AuthService;
  let tasks: TaskService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthService);
    tasks = TestBed.inject(TaskService);
  });

  it('shows nothing to anonymous visitors', () => {
    expect(tasks.tasks()).toEqual([]);
  });

  it('staff only see tasks assigned to them; admins see everything', () => {
    auth.setSession(userOf('admin'));
    const all = tasks.tasks().length;
    auth.setSession(userOf('staff'));
    const mine = tasks.tasks();
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.length).toBeLessThan(all);
    expect(mine.every((t) => t.assigneeId === userOf('staff').id)).toBeTrue();
  });

  it('adds, updates and removes tasks and keeps stats in sync', () => {
    auth.setSession(userOf('admin'));
    const before = tasks.stats().total;
    tasks.add({ title: 'New one', description: '', status: 'todo', priority: 'low', assigneeId: 3, dueDate: '2099-01-01' });
    expect(tasks.stats().total).toBe(before + 1);

    const created = tasks.tasks().find((t) => t.title === 'New one')!;
    tasks.setStatus(created.id, 'done');
    expect(tasks.tasks().find((t) => t.id === created.id)!.status).toBe('done');

    tasks.remove(created.id);
    expect(tasks.stats().total).toBe(before);
  });
});

describe('isOverdue', () => {
  const base: Task = { id: 1, title: 't', description: '', status: 'todo', priority: 'low', assigneeId: 1, dueDate: '2026-01-01' };

  it('is true for past, unfinished tasks', () => {
    expect(isOverdue(base, '2026-01-02')).toBeTrue();
  });
  it('is false for finished tasks and for today or later', () => {
    expect(isOverdue({ ...base, status: 'done' }, '2026-01-02')).toBeFalse();
    expect(isOverdue(base, '2026-01-01')).toBeFalse();
  });
});
