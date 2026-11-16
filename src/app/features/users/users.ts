import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ROLE_LABELS, Role } from '../../core/models';
import { UserService } from '../../core/user.service';

@Component({
  selector: 'app-users',
  template: `
    <div class="page-head">
      <div>
        <h1>Users</h1>
        <p class="muted">Admin only. Change roles or deactivate accounts.</p>
      </div>
    </div>

    <section class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            @for (u of users.users(); track u.id) {
              <tr>
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>
                <td>
                  <select [attr.aria-label]="'Role for ' + u.name" [value]="u.role"
                          [disabled]="u.id === auth.user()?.id"
                          (change)="users.setRole(u.id, $any($event.target).value)">
                    @for (r of roles; track r) { <option [value]="r">{{ labels[r] }}</option> }
                  </select>
                </td>
                <td><span class="pill pill--{{ u.active ? 'done' : 'todo' }}">{{ u.active ? 'Active' : 'Inactive' }}</span></td>
                <td>
                  <button type="button" class="btn btn--ghost btn--sm"
                          [disabled]="u.id === auth.user()?.id" (click)="users.toggleActive(u.id)">
                    {{ u.active ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class UsersPage {
  protected readonly users = inject(UserService);
  protected readonly auth = inject(AuthService);
  protected readonly roles: Role[] = ['admin', 'manager', 'staff'];
  protected readonly labels = ROLE_LABELS;
}
