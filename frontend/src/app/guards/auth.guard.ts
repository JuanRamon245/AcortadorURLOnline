import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ServicioURLService } from '../services/servicio-url.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

// Guard encargado de proteger el redirecionamiento del usuario en la web si no está autorizado
export class AuthGuard implements CanActivate {

  constructor(private servicioURL: ServicioURLService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.servicioURL.getUsuario().pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}