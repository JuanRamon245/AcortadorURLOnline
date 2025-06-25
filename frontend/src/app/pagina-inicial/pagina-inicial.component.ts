import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ServicioURLService } from '../services/servicio-url.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagina-inicial',
  imports: [FormsModule],
  templateUrl: './pagina-inicial.component.html',
  styleUrl: './pagina-inicial.component.scss'
})
export class PaginaInicialComponent {
  urlInput: string = '';
  correo: string = '';

  constructor(private http: HttpClient, private router: Router, private URLServicio: ServicioURLService) {}

  acortarUrl() {
    if (this.urlInput.trim() === '') {
      console.log('Error: la URL está vacía');
      return;
    }

    this.URLServicio.getCorreo().subscribe({
      next: (correoRes) => {
        this.correo = correoRes;

        if (this.correo.trim() === '') {
          console.log('Error: el correo está vacío');
          return;
        }

        this.URLServicio.verificarUrl(this.urlInput).subscribe({
          next: (res) => {
            if (res === 'ok') {
              console.log('URL válida, procediendo a acortar:', this.urlInput);

              this.URLServicio.acortarUrl(this.urlInput, this.correo).subscribe({
                next: (urlCorta) => {
                  const id = urlCorta.split('/').pop();
                  const urlFinal = `http://localhost:8080/api/URL/r/${id}`;
                  console.log('URL acortada:', urlFinal);

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
            console.log('Error: la URL no es válida o no es accesible');
          }
        });

      },
      error: () => {
        console.log('Usuario no logueado, redirigiendo a login');
        this.router.navigate(['/pagina-login']);
      }
    });
  }
}