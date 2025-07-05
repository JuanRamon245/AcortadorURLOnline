import { NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
  nombreUsuario: string = '';
  correoUsuario: string = '';

  @ViewChild('modalContrasena') modalContrasenaRef!: ElementRef;

  constructor(private URLServicio: ServicioURLService, private router: Router) {}

  mostrarContrasenaLogin = false;
  mostrarContrasenaRegistro = false;
  mostrarRepetir = false;
  mostrarRecuperarContrasena = false;
  
  correo = '';
  contrasena = '';
  nombre = '';
  repetirContrasena = '';

  // Método para verificar si el correo electronico cumple con las normas
  validarCorreo(correo: string): boolean {
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regexCorreo.test(correo);
  }
  // Método para verificar si el nombre cumple con las normas
  validarNombre(nombre: string): boolean {
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    return regexNombre.test(nombre);
  }

  // Método para borrar todos los datos y notificaciones de login o registro al cambiar
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

  // Método para redirigir a la página normal y loguearse en caso de que cumpla con lo establecido y del back
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
              window.location.href = '/AcortadorURLOnline/#/';
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

  // Método para mandar una verificación y crear un usuario en la bbdd de la web en caso de que cumpla con lo establecido y del back
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
                this.notificacion = 'Verifica este correo para poder acceder con él.';
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

  // Método que muestra el panel para poder recuperar la contraseña del usuario
  panelRecuperarContrasena() {
    this.mostrarRecuperarContrasena = true;
  }

  // Método que deja de mostrar el panel para poder recuperar la contraseña del usuario
  cerrarRecuperarContrasena() {
    this.mostrarRecuperarContrasena = false;
  }

  // Método para cerrar el panel de recuperar la contraseña en caso de tocar fuera en vez de la 'x' para cerrar
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.mostrarRecuperarContrasena && this.modalContrasenaRef) {
      const clickedInside = this.modalContrasenaRef.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.cerrarRecuperarContrasena();
      }
    }
  }

  // Método para enviar el correo de recuperación de contraseña del usuario en caso de solicitarlo
  // con el panel y mostrar una notificación dependiendo del resultado
  enviarCorreoRecuperacionContrasena() {
    this.URLServicio.enviarCorreoRecuperar(this.correoUsuario).subscribe({
      next: () => {
        this.notificacion = 'Correo de recuperacion enviado correctamente. Revisa tu bandeja de entrada.';
        this.mostrarRecuperarContrasena = false;
        this.correoUsuario = '';
      },
      error: (err) => {
        this.notificacion = 'Error :'+err;
        console.error('Error al enviar correo:', err);
      }
    });
  }
}
