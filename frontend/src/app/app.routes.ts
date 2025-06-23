import { Routes } from '@angular/router';
import { PaginaInicialComponent } from './pagina-inicial/pagina-inicial.component';
import { PaginaURLCortaGeneradaComponent } from './pagina-urlcorta-generada/pagina-urlcorta-generada.component';

export const routes: Routes = [
  { path: '', component: PaginaInicialComponent },
  { path: 'pagina-urlcorta-generada', component: PaginaURLCortaGeneradaComponent }
];
