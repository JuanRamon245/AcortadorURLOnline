import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ServicioURLService } from '../services/servicio-url.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-pagina-inicial',
  imports: [FormsModule, NgIf, NgClass],
  templateUrl: './pagina-inicial.component.html',
  styleUrl: './pagina-inicial.component.scss'
})

export class PaginaInicialComponent {
  tipoMensaje: 'exito' | 'error' = 'exito';
  urlInput: string = '';
  correo: string = '';
  notificacion: string = '';

  constructor(private http: HttpClient, private router: Router, private URLServicio: ServicioURLService) {}

  // Método para acortar las urls de los usuarios
  acortarUrl() {
    // Se verifica si está vacia
    if (this.urlInput.trim() === '') {
      this.notificacion='Error: la URL está vacía';
      return;
    }

    // Se recoge el correo del usuario para después verificar si la url es correcta y accesible
    // para después acortarla y redirigir a la agina donde se podrá ver la url acortada generada
    this.URLServicio.getCorreo().subscribe({
      next: (correoRes) => {
        this.correo = correoRes;

        if (this.correo.trim() === '') {
          console.log('Error: no hay correo en la sesión');
          return;
        }

        this.URLServicio.verificarUrl(this.urlInput).subscribe({
          next: (res) => {
            if (res === 'ok') {
              this.URLServicio.acortarUrl(this.urlInput, this.correo).subscribe({
                next: (urlCorta) => {
                  const id = urlCorta.split('/').pop();
                  const urlFinal = `http://localhost:8080/api/URL/r/${id}`;
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

      },
      error: () => {
        this.notificacion='Usuario no logueado, redirigiendo a login';
        this.router.navigate(['/pagina-login']);
      }
    });
  }
}