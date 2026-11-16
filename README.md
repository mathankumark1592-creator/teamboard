# TeamBoard

A small **Angular 20 + TypeScript** admin dashboard for managing staff, tasks and projects,
with **role-based access** (admin, manager, staff). It runs entirely in the browser against a
mock data layer, so there is nothing to set up besides `npm install`.

## Demo accounts

| Role    | Email              | Password     | What they can do                                         |
| ------- | ------------------ | ------------ | -------------------------------------------------------- |
| Admin   | admin@demo.com     | `admin123`   | Everything, plus the **Users** page                      |
| Manager | manager@demo.com   | `manager123` | See all tasks; create, edit, delete and assign tasks     |
| Staff   | staff@demo.com     | `staff123`   | See **only their own** tasks and update their status     |

## Features

- **Login** with reactive-form validation, loading and error states
- **Route guards:** `authGuard` (must be signed in) and `roleGuard('admin')` (Users page)
- **Dashboard:** summary cards (total, in progress, done, overdue) and two charts
  (tasks by status, open tasks per person), built with a dependency-free CSS bar chart
- **Tasks:** search, status filter, sortable columns (`aria-sort`), pagination,
  create/edit form with validation, delete with confirmation, overdue highlighting
- **Users (admin only):** change roles, activate or deactivate accounts
- **Role-based data:** staff only receive their own tasks (enforced in `TaskService`, not just hidden in the UI)
- Responsive layout, keyboard-friendly, accessible labels

## Quick start

```bash
npm install
npm start          # http://localhost:4200
npm test           # unit tests (Karma + Jasmine, needs Chrome)
npm run build      # production build in dist/
```

## Tech and design choices

- **Standalone components** and the new control flow (`@if`, `@for`), no NgModules
- **Signals** for state (`signal`, `computed`) instead of heavy state libraries
- **Lazy-loaded routes:** each page is its own chunk
- **RxJS** where it fits: the mock login returns a delayed `Observable`, mirroring a real `HttpClient` call
- **Pure logic is separated from UI:** filter, sort and paginate live in `task-query.ts`
  and are unit tested on their own
- **Strict TypeScript** and strict templates
- Session is kept in `sessionStorage` inside try/catch, so the app still works when storage is blocked

## Project structure

```
src/app/
  core/        models, mock data, AuthService, TaskService, UserService, guards
  shared/      reusable bar-chart component
  features/
    login/     sign-in form
    dashboard/ stats and charts
    tasks/     table, query logic (task-query.ts), form
    users/     admin user management
```

## Connecting a real backend

The mock layer is intentionally thin:

1. `AuthService.login()`: swap for `HttpClient.post('/api/auth/login', …)` and store the returned token.
2. Add an `HttpInterceptor` that attaches the token and signs out on 401.
3. `TaskService` and `UserService`: replace the in-memory signals with `HttpClient` calls
   (e.g. a Spring Boot or Node REST API), keeping the same public methods so the components don't change.
4. Keep authorisation checks **on the server**. The guards here only improve UX.

## Tests

19 tests cover authentication, role guards, role-based task visibility, task CRUD and stats,
the filter/sort/paginate logic and the app shell navigation.

## License

MIT
