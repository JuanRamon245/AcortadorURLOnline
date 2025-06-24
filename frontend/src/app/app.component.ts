import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ServicioURLService } from './services/servicio-url.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'frontend';

  respuesta: string = 'Cargando...';

  constructor (private servicioURL : ServicioURLService, private router: Router) { }
  ngOnInit(): void {
    this.servicioURL.getDocumentos().subscribe({
      next: (res) => this.respuesta = res,
      error: (err) => console.error('Error:', err)
    });
  }

  redirigirALogin() {
    this.router.navigate(['/pagina-login']);
  }
}
