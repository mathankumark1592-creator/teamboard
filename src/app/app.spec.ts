import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthService } from './core/auth.service';
import { DEMO_CREDENTIALS } from './core/mock-data';

describe('App shell', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
  });

  it('hides the nav when signed out', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.topbar')).toBeNull();
  });

  it('shows Users in the nav only for admins', () => {
    const auth = TestBed.inject(AuthService);
    const fixture = TestBed.createComponent(App);

    auth.setSession(DEMO_CREDENTIALS[2].user); // staff
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Users');

    auth.setSession(DEMO_CREDENTIALS[0].user); // admin
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Users');
  });
});
