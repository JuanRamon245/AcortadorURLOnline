import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServicioURLService } from '../services/servicio-url.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagina-login',
  imports: [NgIf, FormsModule],
  templateUrl: './pagina-login.component.html',
  styleUrl: './pagina-login.component.scss'
})
export class PaginaLoginComponent {
  modo: 'login' | 'registro' = 'login';

  mensaje: string = '';
  notificacion: string = '';

  constructor(private URLServicio: ServicioURLService, private router: Router) {}

  mostrarContrasenaLogin = false;
  mostrarContrasenaRegistro = false;
  mostrarRepetir = false;
  

  correo = '';
  contrasena = '';
  nombre = '';
  repetirContrasena = '';

  validarCorreo(correo: string): boolean {
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regexCorreo.test(correo);
  }

  validarNombre(nombre: string): boolean {
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    return regexNombre.test(nombre);
  }

  cambiarModo(nuevoModo: 'login' | 'registro') {
    this.modo = nuevoModo;
    this.mensaje = '';
    this.correo = '';
    this.nombre = '';
    this.contrasena = '';
    this.repetirContrasena = '';
    this.mostrarContrasenaLogin = false;
    this.mostrarContrasenaRegistro = false;
    this.mostrarRepetir = false;
  }

  iniciarSesion() {
    if (this.correo === '') {
      this.mensaje = 'El campo correo está vacío';
    } else if (this.contrasena === '') {
      this.mensaje = 'El campo contraseña está vacío';
    } else {
      if (!this.validarCorreo(this.correo)) {
        this.mensaje = 'Correo electronico no valido';
      } else {
         this.URLServicio.acceder(this.correo, this.contrasena).subscribe({
          next: (respuesta: string) => {
            if (respuesta.includes('Inicio de sesión exitoso')) {
              window.location.href = '/';
            } else {
              this.mensaje = respuesta;
            }
          },
          error: err => {
            if (err.status === 401) {
              this.mensaje = err.error;
            } else {
              this.mensaje = 'Error al intentar iniciar sesión';
            }
          }
        });
      }
    }
  }

  registrarse() {
    if (this.nombre === '') {
      this.mensaje = 'El campo nombre está vacío';
    } else if (this.correo === '') {
      this.mensaje = 'El campo correo está vacío';
    } else if (this.contrasena === '') {
      this.mensaje = 'El campo contraseña está vacío';
    } else if (this.repetirContrasena === '') {
      this.mensaje = 'El campo contraseña repetida está vacío';
    } else {
      if (!this.validarNombre(this.nombre)) {
      this.mensaje ='Nombre no valido';
    } else {
      if (!this.validarCorreo(this.correo)) {
        this.mensaje ='Correo electronico no valido';
      } else {
        if (this.contrasena !== this.repetirContrasena) {
          this.mensaje ='Las contraseñas no coinciden';
        } else {
          this.URLServicio.registrarse(this.nombre, this.correo, this.contrasena).subscribe({
            next: (respuesta: any) => {
              if (respuesta.includes('Verifica tu correo antes de completar el registro.')) {
                this.notificacion = 'Verifica tu correo antes de completar el registro.';
                this.mensaje = '';

                setTimeout(() => {
                  this.notificacion = '';
                }, 3000);
              }
            },
            error: err => {
              if (err.status === 409) {
                this.mensaje = err.error;
              } else {
                this.mensaje = 'Error al registrar usuario';
              }
            }
          });
        }
      }
    }
    }
  }
}
