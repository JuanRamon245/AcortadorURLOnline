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
        this.esRutaVerificacion = evento.url.includes('/verificar') || evento.url.includes('/restablecer-contrasena');
      });
  }

  toggleMenu() {
    if (this.respuesta !== 'Registrarse') {
      this.mostrarDropdown = !this.mostrarDropdown;
    } else {
      this.router.navigate(['/pagina-login']);
    }
  }

  cambiarDatos() {
    this.mostrarDropdown = false;
    this.router.navigate(['/pagina-cambiar-datos']);
  }

  redirigirALogin() {
    if (this.respuesta !== 'Registrarse') {
      this.mostrarModal = true;
    } else {
      this.router.navigate(['/pagina-login']);
    }
  }

  redirigirURLs() {
      this.router.navigate(['/pagina-url-acortadas-usuario']);
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

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

  volverHome() {
    this.router.navigate(['/']);
  }

  abrirModalDesdeDropdown() {
    this.mostrarDropdown = false;

    setTimeout(() => {
      this.mostrarModal = true;
    }, 10);
  }

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

  cerrarModalDatos() {
    this.mostrarDatos = false;
  }

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
