import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { DEMO_CREDENTIALS } from './mock-data';
import { authGuard, roleGuard } from './guards';

const run = (guard: typeof authGuard) =>
  TestBed.runInInjectionContext(() => guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

describe('route guards', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('authGuard sends anonymous users to /login', () => {
    const res = run(authGuard) as UrlTree;
    expect(router.serializeUrl(res)).toBe('/login');
  });

  it('authGuard lets signed-in users through', () => {
    auth.setSession(DEMO_CREDENTIALS[2].user);
    expect(run(authGuard)).toBeTrue();
  });

  it('roleGuard blocks other roles and allows the right one', () => {
    auth.setSession(DEMO_CREDENTIALS[2].user); // staff
    expect(router.serializeUrl(run(roleGuard('admin')) as UrlTree)).toBe('/dashboard');
    auth.setSession(DEMO_CREDENTIALS[0].user); // admin
    expect(run(roleGuard('admin'))).toBeTrue();
  });
});
