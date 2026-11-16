import { Injectable, signal } from '@angular/core';
import { SEED_USERS } from './mock-data';
import { Role, User } from './models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly _users = signal<User[]>(structuredClone(SEED_USERS));
  readonly users = this._users.asReadonly();

  nameOf(id: number): string {
    return this._users().find((u) => u.id === id)?.name ?? 'Unassigned';
  }

  setRole(id: number, role: Role): void {
    this._users.update((list) => list.map((u) => (u.id === id ? { ...u, role } : u)));
  }

  toggleActive(id: number): void {
    this._users.update((list) => list.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  }
}
