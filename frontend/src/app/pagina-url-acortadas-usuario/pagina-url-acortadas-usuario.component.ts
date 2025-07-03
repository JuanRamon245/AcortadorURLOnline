import { Component } from '@angular/core';
import { ServicioURLService } from '../services/servicio-url.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-pagina-url-acortadas-usuario',
  imports: [NgIf, NgFor, FormsModule, NgClass],
  templateUrl: './pagina-url-acortadas-usuario.component.html',
  styleUrl: './pagina-url-acortadas-usuario.component.scss'
})

export class PaginaUrlAcortadasUsuarioComponent {
  urls: any[] = [];
  mensaje: string | null = null;
  tipoMensaje: 'exito' | 'error' = 'exito';
  mostrarModal: boolean = false;
  idParaEliminar: string | null = null;

  constructor(private servicioURL: ServicioURLService) {}

  // Método para cargar las urls acortadas del usuario al entrar a la página
  ngOnInit(): void {
    this.cargarUrls();
  }

  // Método que carga las urls del usuario que esté logueado en la sesión
  cargarUrls(): void {
    this.servicioURL.getUrlsDelUsuario().subscribe({
      next: (res) => {
        this.urls = res.map((url) => ({
          ...url,
          nuevosUsos: url.usos
        }));
      },
      error: () => {
        console.error('Error al cargar las URLs del usuario');
      }
    });
  }

  // Método para que el número de usos de la url acortada no sea más que 99 y menos de que 1
  guardarUsos(url: any) {
    const usos = Number(url.nuevosUsos);

    if (isNaN(usos) || usos < 1 || usos > 99) {
      this.mostrarMensaje('El número de usos debe estar entre 1 y 99', 'error');
      return;
    }

    this.servicioURL.actualizarUsos(url.shortId, usos).subscribe({
      next: () => {
        this.mostrarMensaje('Usos actualizados correctamente');
        this.cargarUrls();
      },
      error: () => {
        this.mostrarMensaje('Error al actualizar usos', 'error');
      }
    });
  }

  // Método para abrir el panel que sirve para eliminar la url acortada
  confirmarEliminacion(shortId: string) {
    this.mostrarModal = true;
    this.idParaEliminar = shortId;
  }

  // Método para cerrar el panel que sirve para eliminar la url acortada
  cancelarEliminacion() {
    this.mostrarModal = false;
    this.idParaEliminar = null;
  }

  // Método para confirmar la eliminación de la url acortada y eliminarla en el back de la bbdd
  eliminarConfirmado() {
    if (!this.idParaEliminar) return;

    this.servicioURL.eliminarUrl(this.idParaEliminar).subscribe({
      next: () => {
        this.mostrarMensaje('URL eliminada correctamente');
        this.cargarUrls();
      },
      error: () => {
        this.mostrarMensaje('Error al eliminar la URL', 'error');
      }
    });

    this.mostrarModal = false;
    this.idParaEliminar = null;
  }


  // Método para que el input del número de usos no ponga nunca más que 99 y menos que 1
  validarInput(event: KeyboardEvent, url: any) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const isNumber = /^[0-9]$/.test(event.key);

    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }

    setTimeout(() => {
      const valor = Number(url.nuevosUsos);
      if (valor < 1) {
        url.nuevosUsos = 1;
      } else if (valor > 99) {
        url.nuevosUsos = 99;
      }
    });
  }

  // Método que previene que el usuario pueda pegar cosas en el input
  evitarPegar(event: ClipboardEvent) {
    event.preventDefault();
  }

  // Método para mostrar la notificación de exito o error dependiendo del evento recibido
  mostrarMensaje(texto: string, tipo: 'exito' | 'error' = 'exito') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;

    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }

}
