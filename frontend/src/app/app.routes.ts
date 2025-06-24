import { Routes } from '@angular/router';
import { PaginaInicialComponent } from './pagina-inicial/pagina-inicial.component';
import { PaginaURLCortaGeneradaComponent } from './pagina-urlcorta-generada/pagina-urlcorta-generada.component';
import { PaginaLoginComponent } from './pagina-login/pagina-login.component';
import { PaginaUrlAcortadasUsuarioComponent } from './pagina-url-acortadas-usuario/pagina-url-acortadas-usuario.component';

export const routes: Routes = [
  { path: '', component: PaginaInicialComponent },
  { path: 'pagina-urlcorta-generada', component: PaginaURLCortaGeneradaComponent },
  { path: 'pagina-login', component: PaginaLoginComponent },
  { path: 'pagina-url-acortadas-usuario', component: PaginaUrlAcortadasUsuarioComponent }
];
