import { TestBed } from '@angular/core/testing';

import { ServicioURLService } from './servicio-url.service';

describe('ServicioURLService', () => {
  let service: ServicioURLService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioURLService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
