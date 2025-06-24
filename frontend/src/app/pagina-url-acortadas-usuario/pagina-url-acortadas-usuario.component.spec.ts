import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaUrlAcortadasUsuarioComponent } from './pagina-url-acortadas-usuario.component';

describe('PaginaUrlAcortadasUsuarioComponent', () => {
  let component: PaginaUrlAcortadasUsuarioComponent;
  let fixture: ComponentFixture<PaginaUrlAcortadasUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaUrlAcortadasUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaUrlAcortadasUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
