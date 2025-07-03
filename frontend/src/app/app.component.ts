import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { ServicioURLService } from './services/servicio-url.service';
import { filter } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgIf, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
  title = 'frontend';

  respuesta: string = 'Cargando...';
  respuesta2: string = 'mal';

  nombreUsuario: string = '';
  correoUsuario: string = '';
  contrasenaUsuario: string = '';
  notificacion: string = '';

  mostrarModal = false;
  mostrarDatos = false;
  mostrarDropdown = false;
  esHome = true;
  esRutaVerificacion = false;
  estaEnLoginORegistro = false;

  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  @ViewChild('menuTrigger') menuTrigger!: ElementRef;
  @ViewChild('modalCerrarSesion') modalCerrarSesion!: ElementRef;
  @ViewChild('modalDatos') modalDatos!: ElementRef;

  constructor (private servicioURL : ServicioURLService, private router: Router) { }

  // Método para obtener al iniciar el usuario y la contraseña y modificar dependiendo los datos y eventos mostrar o no el registro, usuario, tus urls o volver
  ngOnInit(): void {
    this.servicioURL.getUsuario().subscribe({
      next: (res) => this.respuesta = res,
      error: () => this.respuesta = 'Registrarse'
    });

    this.servicioURL.getContrasena().subscribe({
      next: (res) => this.respuesta2 = res,
      error: () => this.respuesta2 = 'Registrarse'
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.esHome = url === '/';
        this.estaEnLoginORegistro = url === '/pagina-login' || url === '/pagina-registro' || url === '/pagina-urlcorta-generada' || url === '/pagina-url-acortadas-usuario' || url === '/pagina-redireccion-incorrecta';

      });

      this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((evento: any) => {
        this.esRutaVerificacion = evento.url.includes('/verificar') || evento.url.includes('/restablecer-contrasena') || evento.url.includes('/pagina-redireccion-incorrecta');
      });
  }

  // Método para redirigir al login en caso de que el usuario no este registrado
  toggleMenu() {
    if (this.respuesta !== 'Registrarse') {
      this.mostrarDropdown = !this.mostrarDropdown;
    } else {
      this.router.navigate(['/pagina-login']);
    }
  }

  // Método para redirigir al usuario a la página de urls acortadas por él
  redirigirURLs() {
      this.router.navigate(['/pagina-url-acortadas-usuario']);
  }

  // Método para cerrar el menú de cerrar sesión
  cerrarModal() {
    this.mostrarModal = false;
  }

  // Método para cerrar sesión del usuario actualmente logueado
  cerrarSesion() {
    this.servicioURL.logout().subscribe({
      next: () => {
      this.mostrarDropdown = false;
      this.mostrarModal = false;
      this.respuesta = 'Registrarse';
      this.router.navigate(['/']);
    },
      error: (err) => console.error('Error cerrando sesión:', err)
    });
  }

  // Método para cerrar los menús si se toca por fuera
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInsideDropdown = this.dropdownMenu?.nativeElement.contains(event.target);
    const clickedMenuTrigger = this.menuTrigger?.nativeElement.contains(event.target);
    const clickedInsideModal = this.modalCerrarSesion?.nativeElement.contains(event.target);
    const clickedInsideModalDatos = this.modalDatos?.nativeElement.contains(event.target);

    if (!clickedInsideDropdown && !clickedMenuTrigger) {
      this.mostrarDropdown = false;
    }

    if (this.mostrarModal && !clickedInsideModal) {
      this.mostrarModal = false;
    }

    if (this.mostrarDatos && !clickedInsideModalDatos) {
      this.mostrarDatos = false;
    }
  }

  // Método para redirigir el usuario la página inicial
  volverHome() {
    this.router.navigate(['/']);
  }

  // Método para mostrar notificaciones
  abrirModalDesdeDropdown() {
    this.mostrarDropdown = false;

    setTimeout(() => {
      this.mostrarModal = true;
    }, 10);
  }

  // Método para abrir el menú de los datos del usuario
  abrirModalDatos() {
    this.mostrarDropdown = false;

    this.servicioURL.getDatosUsuario().subscribe({
      next: (res) => {
        this.nombreUsuario = res.nombre;
        this.correoUsuario = res.correo;
        this.contrasenaUsuario = res.contrasena;
        this.mostrarDatos = true;
      },
      error: (err) => {
        this.notificacion ='Error obteniendo datos del usuario';
      }
    });

    console.log(this.contrasenaUsuario);
  }

  // Método para cerrar el menú del usuario
  cerrarModalDatos() {
    this.mostrarDatos = false;
  }

  // Método para guardar los nuevos datos del usuario en la bbdd
  guardarCambiosUsuario() {
    console.log('Intentando actualizar con:', this.nombreUsuario, this.correoUsuario, this.contrasenaUsuario);
    const nuevosDatos = {
      nombre: this.nombreUsuario,
      correo: this.correoUsuario,
      contrasena: this.contrasenaUsuario
    };

    this.servicioURL.actualizarDatosUsuario(nuevosDatos).subscribe({
      next: () => {
        this.notificacion = 'Datos actualizados correctamente';
        this.mostrarDatos = false;
        location.reload();
      },
      error: (err) => {
        console.error('Error al actualizar datos:', err);
        this.notificacion = 'Ocurrió un error al actualizar los datos';
      }
    });
  }
}
