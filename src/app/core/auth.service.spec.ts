import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let auth: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthService);
  });

  it('logs in with valid demo credentials', async () => {
    const user = await firstValueFrom(auth.login('Admin@demo.com ', 'admin123'));
    expect(user.role).toBe('admin');
  });

  it('rejects a wrong password', async () => {
    await expectAsync(firstValueFrom(auth.login('admin@demo.com', 'nope'))).toBeRejectedWithError(
      'Invalid email or password',
    );
  });

  it('tracks session state and roles', async () => {
    expect(auth.isLoggedIn()).toBeFalse();
    auth.setSession(await firstValueFrom(auth.login('staff@demo.com', 'staff123')));
    expect(auth.isLoggedIn()).toBeTrue();
    expect(auth.hasRole('staff')).toBeTrue();
    expect(auth.hasRole('admin', 'manager')).toBeFalse();
    auth.logout();
    expect(auth.isLoggedIn()).toBeFalse();
  });
});
