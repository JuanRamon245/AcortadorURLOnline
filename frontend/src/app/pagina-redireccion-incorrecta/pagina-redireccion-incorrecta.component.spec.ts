import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaRedireccionIncorrectaComponent } from './pagina-redireccion-incorrecta.component';

describe('PaginaRedireccionIncorrectaComponent', () => {
  let component: PaginaRedireccionIncorrectaComponent;
  let fixture: ComponentFixture<PaginaRedireccionIncorrectaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaRedireccionIncorrectaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaRedireccionIncorrectaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
