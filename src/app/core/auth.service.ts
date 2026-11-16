import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { DEMO_CREDENTIALS } from './mock-data';
import { Role, User } from './models';

const STORAGE_KEY = 'teamboard.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(this.restore());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly role = computed<Role | null>(() => this._user()?.role ?? null);

  /** Mock login: replace the body with an HttpClient call to a real API. */
  login(email: string, password: string): Observable<User> {
    const match = DEMO_CREDENTIALS.find(
      (c) => c.email === email.trim().toLowerCase() && c.password === password,
    );
    if (!match) {
      return throwError(() => new Error('Invalid email or password')).pipe(delay(300));
    }
    return of(match.user).pipe(delay(300));
  }

  setSession(user: User): void {
    this._user.set(user);
    this.persist(user);
  }

  logout(): void {
    this._user.set(null);
    this.persist(null);
  }

  hasRole(...roles: Role[]): boolean {
    const r = this.role();
    return r !== null && roles.includes(r);
  }

  // sessionStorage can throw (private mode, blocked storage), so the app must work without it.
  private restore(): User | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private persist(user: User | null): void {
    try {
      if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}
