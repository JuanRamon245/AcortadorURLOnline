import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ServicioURLService } from '../services/servicio-url.service';

@Injectable({
  providedIn: 'root'
})

export class noAuthGuard implements CanActivate {
  constructor(private servicioURL: ServicioURLService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.servicioURL.getUsuario().pipe(
      map(() => {
        this.router.navigate(['/']);
        return false;
      }),
      catchError(() => {
        return of(true);
      })
    );
  }
}