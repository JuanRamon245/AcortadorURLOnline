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
      alert('Por favor, ingresa una URL válida.');
      return;
    }
    console.log('URL a acortar:', this.urlInput);
  }

}
