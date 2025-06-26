import { Routes } from '@angular/router';
import { PaginaInicialComponent } from './pagina-inicial/pagina-inicial.component';
import { PaginaURLCortaGeneradaComponent } from './pagina-urlcorta-generada/pagina-urlcorta-generada.component';
import { PaginaLoginComponent } from './pagina-login/pagina-login.component';
import { PaginaUrlAcortadasUsuarioComponent } from './pagina-url-acortadas-usuario/pagina-url-acortadas-usuario.component';
import { UrlGuard } from './guards/url.guard';
import { AuthGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';
import { PaginaRedireccionIncorrectaComponent } from './pagina-redireccion-incorrecta/pagina-redireccion-incorrecta.component';
import { RedireccionInvalidaGuard } from './guards/redireccion-invalida.guard';

export const routes: Routes = [
  { path: '', component: PaginaInicialComponent },
  { path: 'pagina-urlcorta-generada', component: PaginaURLCortaGeneradaComponent, canActivate: [UrlGuard] },
  { path: 'pagina-login', component: PaginaLoginComponent, canActivate: [noAuthGuard] },
  { path: 'pagina-url-acortadas-usuario', component: PaginaUrlAcortadasUsuarioComponent, canActivate: [AuthGuard] },
  { path: 'pagina-redireccion-incorrecta', component: PaginaRedireccionIncorrectaComponent, canActivate: [RedireccionInvalidaGuard] }
];
