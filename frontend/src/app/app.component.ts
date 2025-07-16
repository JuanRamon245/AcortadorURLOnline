import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { ServicioURLService } from './services/servicio-url.service';
import { filter } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';

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
  mostrarContrasenaModal: boolean = false;

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

  constructor (private servicioURL : ServicioURLService, private router: Router) { 
    // Metodo apra que como estoy usando el #/ para solucionar el problema principal, de redireciones,
    // en el caso de que la ruta contenga más de un # pues que redirija al home
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const fullUrl = window.location.href;
        const hashCount = (fullUrl.match(/#/g) || []).length;

        // Si hay más de un # en la URL (mal formada)
        if (hashCount > 1) {
          console.warn('Ruta inválida detectada. Redirigiendo a la raíz.');
          window.location.href = '/';
        }
      }
    });
  }

  // Método para obtener al iniciar el usuario y la contraseña y modificar dependiendo los datos y eventos mostrar o no el registro, usuario, tus urls o volver
  ngOnInit(): void {
    this.verificarToken();

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

  // Método para recoger y comprobar los datos de la sesión por medio de las Jwt, en el caso de haber datos se guardan para usarse
  verificarToken(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const ahora = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp < ahora) {
          this.nombreUsuario = '';
          this.correoUsuario = '';
          localStorage.removeItem('jwt');
          this.respuesta = 'Registrarse'
        } else {
          this.nombreUsuario = decoded.nombre;
          this.correoUsuario = decoded.sub;

          this.respuesta = decoded.nombre;
        }
      } catch (error) {
        console.error('Token inválido:', error);
        this.nombreUsuario = '';
        this.correoUsuario = '';
        localStorage.removeItem('jwt');
        this.respuesta = 'Registrarse'
      }
    } else {
      this.nombreUsuario = '';
      this.correoUsuario = '';
      this.respuesta = 'Registrarse'
    }
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
    localStorage.removeItem('jwt');
    this.mostrarDropdown = false;
    this.mostrarModal = false;
    window.location.href = '/';
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

    setTimeout(() => {
      this.servicioURL.obtenerContrasenaUsuario(this.correoUsuario).subscribe({
        next: (respuesta) => {
          this.contrasenaUsuario = respuesta;
          this.mostrarDatos = true;
        },
        error: (err) => {
          console.error('Error al cargar los datos:', err);
          this.notificacion = 'Ocurrió un error al cargar los datos';
        }
      });
      
    }, 10);
  }

  // Método para cerrar el menú del usuario
  cerrarModalDatos() {
    this.mostrarDatos = false;
  }

  // Método para guardar los nuevos datos del usuario en la bbdd
  guardarCambiosUsuario() {
    this.notificacion ='Error obteniendo datos del usuario';
    const nuevosDatos = {
      nombre: this.nombreUsuario,
      correo: this.correoUsuario,
      contrasena: this.contrasenaUsuario
    };

    this.servicioURL.actualizarDatosUsuario(nuevosDatos).subscribe({
      next: (respuesta: any) => {
        this.notificacion = 'Datos actualizados correctamente';
        this.mostrarDatos = false;

        console.log(respuesta.token);

        if (respuesta && respuesta.token) {
          localStorage.setItem('jwt', respuesta.token);
          this.verificarToken();
        }

        location.reload();
      },
      error: (err) => {
        console.error('Error al actualizar datos:', err);
        this.notificacion = 'Ocurrió un error al actualizar los datos';
      }
    });
  }
}
