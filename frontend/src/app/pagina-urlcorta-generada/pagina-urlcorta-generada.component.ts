import { Component, OnInit } from '@angular/core';
import { ServicioURLService } from '../services/servicio-url.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagina-urlcorta-generada',
  imports: [],
  templateUrl: './pagina-urlcorta-generada.component.html',
  styleUrl: './pagina-urlcorta-generada.component.scss'
})


export class PaginaURLCortaGeneradaComponent implements OnInit {
  urlAcortada: string = 'Cargando...';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const state = window.history.state as { url?: string };

    if (state?.url) {
      this.urlAcortada = state.url;
    } else {
      this.urlAcortada = 'No se generó ninguna URL.';
    }
  }

  copiarAlPortapapeles() {
    navigator.clipboard.writeText(this.urlAcortada).then(() => {
      console.log('Copiado al portapapeles');
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
  }
}

