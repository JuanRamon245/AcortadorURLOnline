import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TokenVerificacionGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = route.queryParamMap.get('token');
    if (token) {
      return true;
    } else {
      // redirigir si no viene con token
      this.router.navigate(['/']);
      return false;
    }
  }
}
