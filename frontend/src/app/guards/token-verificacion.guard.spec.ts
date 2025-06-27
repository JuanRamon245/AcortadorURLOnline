import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { tokenVerificacionGuard } from './token-verificacion.guard';

describe('tokenVerificacionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => tokenVerificacionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
