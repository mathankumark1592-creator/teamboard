import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { ROLE_LABELS } from './core/models';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (auth.user(); as user) {
      <header class="topbar">
        <a class="brand" routerLink="/dashboard">TeamBoard</a>
        <nav aria-label="Main">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/tasks" routerLinkActive="active">Tasks</a>
          @if (auth.hasRole('admin')) {
            <a routerLink="/users" routerLinkActive="active">Users</a>
          }
        </nav>
        <div class="who">
          <span>{{ user.name }} <small class="pill">{{ roleLabels[user.role] }}</small></span>
          <button type="button" class="btn btn--ghost" (click)="logout()">Sign out</button>
        </div>
      </header>
    }
    <main class="page">
      <router-outlet />
    </main>
  `,
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly roleLabels = ROLE_LABELS;

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
