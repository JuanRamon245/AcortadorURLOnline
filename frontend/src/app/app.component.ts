import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { ServicioURLService } from './services/servicio-url.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'frontend';

  respuesta: string = 'Cargando...';

  mostrarModal = false;
  esHome = true;
  estaEnLoginORegistro = false;

  constructor (private servicioURL : ServicioURLService, private router: Router) { }
  ngOnInit(): void {
    // Detectar si hay sesión
    this.servicioURL.getUsuario().subscribe({
      next: (res) => this.respuesta = res,
      error: () => this.respuesta = 'Registrarse'
    });

    // Detectar si estamos en el home
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.esHome = url === '/';
        this.estaEnLoginORegistro = url === '/pagina-login' || url === '/pagina-registro';
      });
  }

  redirigirALogin() {
    if (this.respuesta !== 'Registrarse') {
      this.mostrarModal = true;
    } else {
      this.router.navigate(['/pagina-login']);
    }
  }

  redirigirURLs() {
      this.router.navigate(['/pagina-url-acortadas-usuario']);
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  cerrarSesion() {
    this.servicioURL.logout().subscribe({
      next: () => {
      this.mostrarModal = false;
      this.respuesta = 'Registrarse';
      this.router.navigate(['/']);
    },
      error: (err) => console.error('Error cerrando sesión:', err)
    });
  }

  volverHome() {
    this.router.navigate(['/']);
  }
}
