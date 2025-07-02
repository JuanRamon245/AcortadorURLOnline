import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { ServicioURLService } from '../services/servicio-url.service';

@Component({
  selector: 'app-verificacion',
  imports: [NgIf],
  templateUrl: 'verificacion.component.html',
  styleUrl: './verificacion.component.scss'
})
export class VerificacionComponent implements OnInit {
  mensaje = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private servicioURL: ServicioURLService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    console.log("Token recibido:", token);
    if (token) {
      this.servicioURL.verificarUsuario(token).subscribe({
        next: () => {
          this.mensaje = 'Cuenta verificada correctamente. Ya puedes iniciar sesión y cerrar esta página.';
        },
        error: () => {
          this.mensaje = 'El token es inválido o la cuenta ya fue verificada.';
        }
      });
    } else {
      this.mensaje = 'Token de verificación no encontrado en la URL.';
    }
  }
}
