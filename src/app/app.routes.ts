import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';

// Every feature is lazy-loaded, so each screen ships as its own chunk.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    title: 'Sign in · TeamBoard',
    loadComponent: () => import('./features/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'dashboard',
    title: 'Dashboard · TeamBoard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardPage),
  },
  {
    path: 'tasks',
    title: 'Tasks · TeamBoard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tasks/tasks').then((m) => m.TasksPage),
  },
  {
    path: 'users',
    title: 'Users · TeamBoard',
    canActivate: [authGuard, roleGuard('admin')],
    loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
  },
  { path: '**', redirectTo: 'dashboard' },
];
