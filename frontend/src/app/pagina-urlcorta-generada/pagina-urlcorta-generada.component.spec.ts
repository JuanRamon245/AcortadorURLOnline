import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaURLCortaGeneradaComponent } from './pagina-urlcorta-generada.component';

describe('PaginaURLCortaGeneradaComponent', () => {
  let component: PaginaURLCortaGeneradaComponent;
  let fixture: ComponentFixture<PaginaURLCortaGeneradaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaURLCortaGeneradaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaURLCortaGeneradaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
