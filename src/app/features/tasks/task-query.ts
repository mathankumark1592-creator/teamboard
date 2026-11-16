import { Priority, Task, TaskStatus } from '../../core/models';

export type SortKey = 'title' | 'status' | 'priority' | 'dueDate' | 'assignee';
export type SortDir = 'asc' | 'desc';

export interface TaskQuery {
  search: string;
  status: TaskStatus | 'all';
  sortKey: SortKey;
  sortDir: SortDir;
  page: number; // 1-based
  pageSize: number;
}

export interface TaskPage {
  rows: Task[];
  total: number; // after filtering
  pages: number;
  page: number; // clamped
}

const PRIORITY_RANK: Record<Priority, number> = { low: 0, medium: 1, high: 2 };
const STATUS_RANK: Record<TaskStatus, number> = { todo: 0, 'in-progress': 1, done: 2 };

/** Pure filter + sort + paginate step, kept outside the component so it is easy to unit test. */
export function applyQuery(tasks: Task[], q: TaskQuery, nameOf: (id: number) => string): TaskPage {
  const needle = q.search.trim().toLowerCase();

  const filtered = tasks.filter((t) => {
    if (q.status !== 'all' && t.status !== q.status) return false;
    if (!needle) return true;
    return (
      t.title.toLowerCase().includes(needle) ||
      t.description.toLowerCase().includes(needle) ||
      nameOf(t.assigneeId).toLowerCase().includes(needle)
    );
  });

  const dir = q.sortDir === 'asc' ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    switch (q.sortKey) {
      case 'priority': return (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * dir;
      case 'status': return (STATUS_RANK[a.status] - STATUS_RANK[b.status]) * dir;
      case 'dueDate': return a.dueDate.localeCompare(b.dueDate) * dir;
      case 'assignee': return nameOf(a.assigneeId).localeCompare(nameOf(b.assigneeId)) * dir;
      default: return a.title.localeCompare(b.title) * dir;
    }
  });

  const pages = Math.max(1, Math.ceil(sorted.length / q.pageSize));
  const page = Math.min(Math.max(1, q.page), pages);
  const start = (page - 1) * q.pageSize;
  return { rows: sorted.slice(start, start + q.pageSize), total: sorted.length, pages, page };
}
