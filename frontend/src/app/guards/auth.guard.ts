import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ServicioURLService } from '../services/servicio-url.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private servicioURL: ServicioURLService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.servicioURL.getUsuario().pipe(
      map(() => true), // acceso permitido si está logueado
      catchError(() => {
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}