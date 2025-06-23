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

  constructor(private http: HttpClient, private router: Router, private URLServicio: ServicioURLService) {}

  acortarUrl() {
  if (this.urlInput.trim() === '') {
    console.log('Error: la URL está vacía');
    return;
  }

  this.URLServicio.verificarUrl(this.urlInput).subscribe({
    next: (res) => {
      if (res === 'ok') {
        console.log('URL válida, procediendo a acortar:', this.urlInput);

        // Ahora llamamos al backend para acortar y guardar la URL
        this.URLServicio.acortarUrl(this.urlInput).subscribe({
          next: (urlCorta) => {

            const id = urlCorta.split('/').pop();
            const urlFinal = `http://localhost:8080/api/URL/r/${id}`;
            console.log('URL acortada:', urlFinal);

            this.router.navigate(['/pagina-urlcorta-generada'], {
              state: { url: urlFinal}
            });
          },
          error: (err) => {
            console.log('Error al acortar la URL');
          }
        });

      } else {
        console.log('Error en validación:', res);
      }
    },
    error: (err) => {
      // Silenciar el error 400, como pediste antes
      if (err.status !== 400) {
        console.log('Error: la URL no es válida o no es accesible');
      }
    }
  });
}

}