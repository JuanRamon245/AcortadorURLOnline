import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ServicioURLService } from '../services/servicio-url.service';

@Injectable({
  providedIn: 'root'
})

// Guard encargado de proteger el redirecionamiento del usuario en la web si el usuario no ha acortado una url por lo menos
export class UrlGuard implements CanActivate {

  constructor(private servicioURL: ServicioURLService, private router: Router) {}

  canActivate(): boolean {
    const haAcortado = this.servicioURL.haAcortadoAlMenosUna();

    if (!haAcortado) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/']);
      });
      return false;
    }

    return true;
  }
}
