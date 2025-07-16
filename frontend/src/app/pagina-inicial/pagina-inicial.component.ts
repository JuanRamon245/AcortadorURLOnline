import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ServicioURLService } from '../services/servicio-url.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { NgClass } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-pagina-inicial',
  imports: [FormsModule, NgIf, NgClass],
  templateUrl: './pagina-inicial.component.html',
  styleUrl: './pagina-inicial.component.scss'
})

export class PaginaInicialComponent {
  tipoMensaje: 'exito' | 'error' = 'exito';
  urlInput: string = '';
  correoUsuario: string = '';
  notificacion: string = '';

  constructor(private http: HttpClient, private router: Router, private URLServicio: ServicioURLService) {}

  //Metodo para obtener los datos de la sesión por medio de las Jwt
  verificarToken(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const ahora = Math.floor(Date.now() / 1000);
  
        if (decoded.exp && decoded.exp < ahora) {
          this.correoUsuario = '';
          localStorage.removeItem('jwt');
        } else {
          this.correoUsuario = decoded.sub;
        }
      } catch (error) {
        console.error('Token inválido:', error);
        this.correoUsuario = '';
        localStorage.removeItem('jwt');
      }
    } else {
      this.correoUsuario = '';
    }
  }

  // Método para acortar las urls de los usuarios
  acortarUrl() {

    this.verificarToken();

    this.notificacion = '';

    // Se verifica si está vacia
    if (this.urlInput.trim() === '') {
      this.notificacion='Error: la URL está vacía';
      return;
    }

    // En el caso de no haber usuario en la sesión redirigir al login, en el caso de haberlo, acortar la url aportada por el usuario
    if (this.correoUsuario.trim() === '') {
      this.notificacion='Usuario no logueado, redirigiendo a login';
      this.router.navigate(['/pagina-login']);
    } else {
      this.URLServicio.verificarUrl(this.urlInput).subscribe({
          next: (res) => {
            if (res === 'ok') {
              this.URLServicio.acortarUrl(this.urlInput, this.correoUsuario).subscribe({
                next: (urlCorta) => {
                  const id = urlCorta.split('/').pop();
                  const urlFinal = `https://acortadorurlonline-production.up.railway.app/api/URL/r/${id}`;
                  this.URLServicio.marcarComoAcortado();
                  this.router.navigate(['/pagina-urlcorta-generada'], {
                    state: { url: urlFinal }
                  });
                },
                error: () => {
                  console.log('Error al acortar la URL');
                }
              });

            } else {
              console.log('Error en validación:', res);
            }
          },
          error: () => {
            this.notificacion='Error: la URL no es válida o no es accesible';
          }
        });
    }
  }
}