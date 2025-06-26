import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-pagina-redireccion-incorrecta',
  imports: [RouterModule],
  templateUrl: './pagina-redireccion-incorrecta.component.html',
  styleUrl: './pagina-redireccion-incorrecta.component.scss'
})
export class PaginaRedireccionIncorrectaComponent {

  constructor(private router: Router) {}

  volverInicio() {
    this.router.navigate(['/']);
  }
}
