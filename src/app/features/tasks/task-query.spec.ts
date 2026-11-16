import { Task } from '../../core/models';
import { TaskQuery, applyQuery } from './task-query';

const names: Record<number, string> = { 1: 'Ann', 2: 'Bob' };
const nameOf = (id: number) => names[id] ?? 'Unassigned';

const t = (id: number, over: Partial<Task>): Task => ({
  id, title: `Task ${id}`, description: '', status: 'todo', priority: 'low', assigneeId: 1, dueDate: '2026-01-01', ...over,
});

const data: Task[] = [
  t(1, { title: 'Alpha', priority: 'high', dueDate: '2026-03-01', assigneeId: 2 }),
  t(2, { title: 'beta', status: 'done', priority: 'low', dueDate: '2026-01-01' }),
  t(3, { title: 'Gamma', status: 'in-progress', priority: 'medium', dueDate: '2026-02-01' }),
  t(4, { title: 'Delta', description: 'needs REVIEW', dueDate: '2026-04-01' }),
];

const q = (over: Partial<TaskQuery> = {}): TaskQuery => ({
  search: '', status: 'all', sortKey: 'title', sortDir: 'asc', page: 1, pageSize: 10, ...over,
});

describe('applyQuery', () => {
  it('sorts by title case-insensitively, asc and desc', () => {
    expect(applyQuery(data, q(), nameOf).rows.map((r) => r.title)).toEqual(['Alpha', 'beta', 'Delta', 'Gamma']);
    expect(applyQuery(data, q({ sortDir: 'desc' }), nameOf).rows[0].title).toBe('Gamma');
  });

  it('sorts priority by rank, not alphabetically', () => {
    const rows = applyQuery(data, q({ sortKey: 'priority', sortDir: 'desc' }), nameOf).rows;
    expect(rows[0].priority).toBe('high');
    expect(rows[1].priority).toBe('medium');
  });

  it('searches title, description and assignee name', () => {
    expect(applyQuery(data, q({ search: 'review' }), nameOf).rows.map((r) => r.id)).toEqual([4]);
    expect(applyQuery(data, q({ search: 'bob' }), nameOf).rows.map((r) => r.id)).toEqual([1]);
  });

  it('filters by status', () => {
    const res = applyQuery(data, q({ status: 'done' }), nameOf);
    expect(res.total).toBe(1);
    expect(res.rows[0].id).toBe(2);
  });

  it('paginates and clamps an out-of-range page', () => {
    const p1 = applyQuery(data, q({ pageSize: 3 }), nameOf);
    expect(p1.pages).toBe(2);
    expect(p1.rows.length).toBe(3);
    const p9 = applyQuery(data, q({ pageSize: 3, page: 9 }), nameOf);
    expect(p9.page).toBe(2);
    expect(p9.rows.length).toBe(1);
  });

  it('returns one empty page when nothing matches', () => {
    const res = applyQuery(data, q({ search: 'zzz' }), nameOf);
    expect(res).toEqual({ rows: [], total: 0, pages: 1, page: 1 });
  });
});
