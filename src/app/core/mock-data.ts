import { Priority, Task, TaskStatus, User } from './models';

/** Demo accounts. Passwords exist only in this mock layer. */
export const DEMO_CREDENTIALS: { email: string; password: string; user: User }[] = [
  { email: 'admin@demo.com', password: 'admin123', user: { id: 1, name: 'Alex Admin', email: 'admin@demo.com', role: 'admin', active: true } },
  { email: 'manager@demo.com', password: 'manager123', user: { id: 2, name: 'Maya Manager', email: 'manager@demo.com', role: 'manager', active: true } },
  { email: 'staff@demo.com', password: 'staff123', user: { id: 3, name: 'Sam Staff', email: 'staff@demo.com', role: 'staff', active: true } },
];

export const SEED_USERS: User[] = [
  ...DEMO_CREDENTIALS.map((c) => c.user),
  { id: 4, name: 'Priya Patel', email: 'priya@demo.com', role: 'staff', active: true },
  { id: 5, name: 'Jordan Lee', email: 'jordan@demo.com', role: 'staff', active: true },
  { id: 6, name: 'Chris Wong', email: 'chris@demo.com', role: 'staff', active: false },
];

const TITLES = [
  'Design landing page', 'Fix login redirect', 'Write API docs', 'Set up CI pipeline',
  'Review pull requests', 'Update onboarding emails', 'Optimise image loading', 'Plan sprint backlog',
  'Migrate user table', 'Add dark mode', 'Audit accessibility', 'Create release notes',
  'Refactor auth module', 'Prepare client demo', 'Investigate slow query', 'Translate help pages',
  'Add CSV export', 'Clean up unused code', 'Write unit tests', 'Upgrade dependencies',
  'Draft pricing page', 'Fix mobile menu', 'Configure monitoring', 'Interview notes summary',
  'Build notification settings', 'Compress static assets', 'Create FAQ section', 'Test payment flow',
];

const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const ASSIGNEES = [2, 3, 4, 5, 3, 4, 5, 3];

function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Deterministic seed data (no randomness) so the demo looks the same every run. */
export function buildSeedTasks(): Task[] {
  return TITLES.map((title, i) => ({
    id: i + 1,
    title,
    description: `Details for "${title.toLowerCase()}". Replace with real notes.`,
    status: STATUSES[(i * 7 + 1) % 3],
    priority: PRIORITIES[(i * 5 + 2) % 3],
    assigneeId: ASSIGNEES[i % ASSIGNEES.length],
    dueDate: isoOffset(((i * 5) % 21) - 6),
  }));
}
