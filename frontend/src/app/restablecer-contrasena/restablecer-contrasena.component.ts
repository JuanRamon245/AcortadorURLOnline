import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ServicioURLService } from '../services/servicio-url.service';

@Component({
  selector: 'app-restablecer-contrasena',
  imports: [NgIf, FormsModule],
  templateUrl: './restablecer-contrasena.component.html',
  styleUrl: './restablecer-contrasena.component.scss'
})


export class RestablecerContrasenaComponent {
  modo: 'sinRestablecer' | 'restablecer' | 'error' = 'sinRestablecer';
  nuevaContrasenaUsuario = '';
  token = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private servicioURL: ServicioURLService,) {}

  // Método para recoger el token de la url donde fué redirigido el usuario
  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  // Método para restablecer la contraseña, se revisa si los datos están completos y a partir de ahi en el back se encarga de modificarla para el usuario
  restablecerContrasena() {
    if (!this.nuevaContrasenaUsuario || !this.token) {
      this.modo = 'error';
      return;
    }

    const datos = {
      token: this.token,
      contrasena: this.nuevaContrasenaUsuario
    };

    this.servicioURL.restablecerContrasena(datos).subscribe({
      next: () => {
          console.log('Contraseña restablecida correctamente. Ya puedes iniciar sesión y cerrar esta página.');
          this.modo = 'restablecer';
        },
        error: () => {
          console.log('El token es inválido o la cuenta no solicito restablecer su contraseña.');
          this.modo = 'error';
        }
      });
  }

}
