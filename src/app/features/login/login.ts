import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DEMO_CREDENTIALS } from '../../core/mock-data';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <section class="card login">
      <h1>Sign in</h1>
      <p class="muted">Use a demo account to explore each role.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" autocomplete="username" />
          @if (show('email')) {
            <p class="error">
              @if (form.controls.email.hasError('required')) { Email is required }
              @else { Enter a valid email address }
            </p>
          }
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password" autocomplete="current-password" />
          @if (show('password')) {
            <p class="error">Password is required</p>
          }
        </div>

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
        <button class="btn" type="submit" [disabled]="loading()">
          {{ loading() ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <div class="demo">
        <p class="muted">Demo accounts (click to fill):</p>
        @for (c of demo; track c.email) {
          <button type="button" class="btn btn--ghost btn--sm" (click)="fill(c.email, c.password)">
            {{ c.user.role }}
          </button>
        }
      </div>
    </section>
  `,
  styles: `
    .login { max-width: 400px; margin: 48px auto; }
    .demo { margin-top: 20px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .demo p { width: 100%; }
    .login .btn[type='submit'] { width: 100%; margin-top: 6px; }
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly demo = DEMO_CREDENTIALS;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected show(name: 'email' | 'password'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected fill(email: string, password: string): void {
    this.form.setValue({ email, password });
    this.error.set(null);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: (user) => {
        this.auth.setSession(user);
        this.router.navigate(['/dashboard']);
      },
      error: (e: Error) => {
        this.error.set(e.message);
        this.loading.set(false);
      },
    });
  }
}
