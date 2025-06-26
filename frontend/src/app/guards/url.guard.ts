import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ServicioURLService } from '../services/servicio-url.service';

@Injectable({
  providedIn: 'root'
})
export class UrlGuard implements CanActivate {

  constructor(private servicioURL: ServicioURLService, private router: Router) {}

  canActivate(): boolean {
    const haAcortado = this.servicioURL.haAcortadoAlMenosUna();

    if (!haAcortado) {
      // Redirección forzada para que se recargue correctamente el componente inicial
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/']);
      });
      return false;
    }

    return true;
  }
}
