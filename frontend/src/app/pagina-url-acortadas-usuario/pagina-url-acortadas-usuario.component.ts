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

 ngOnInit(): void {
    this.cargarUrls();
  }

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

  confirmarEliminacion(shortId: string) {
    this.mostrarModal = true;
    this.idParaEliminar = shortId;
  }

  cancelarEliminacion() {
    this.mostrarModal = false;
    this.idParaEliminar = null;
  }

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

  evitarPegar(event: ClipboardEvent) {
    event.preventDefault();
  }

  mostrarMensaje(texto: string, tipo: 'exito' | 'error' = 'exito') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;

    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }

}
