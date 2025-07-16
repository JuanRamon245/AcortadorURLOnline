import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ServicioURLService } from '../services/servicio-url.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})

// Guard encargado de proteger el redirecionamiento del usuario en la web si está autorizado
export class noAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): Observable<boolean> {
    const token = localStorage.getItem('jwt');

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const ahora = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp > ahora) {
          this.router.navigate(['/']);
          return of(false);
        }
      } catch (error) {
        console.warn('Token inválido en noAuthGuard:', error);
      }
    }

    return of(true);
  }
}