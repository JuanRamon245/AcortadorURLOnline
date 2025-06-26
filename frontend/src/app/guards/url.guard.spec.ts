import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { urlGuard } from './url.guard';

describe('urlGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => urlGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
