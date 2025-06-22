import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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

  constructor (private servicioURL : ServicioURLService ) { }
    ngOnInit(): void {
    this.servicioURL.getDocumentos().subscribe({
      next: (res) => this.respuesta = res,
      error: (err) => console.error('Error:', err)
    });
  }
  /*constructor(private servicio-url: DocumentoService) {}

  ngOnInit(): void {
    this.servicio-url.getDocumentos().subscribe({
      next: (res) => this.respuesta = res,
      error: (err) => console.error('Error:', err)
    });
  }*/
}
