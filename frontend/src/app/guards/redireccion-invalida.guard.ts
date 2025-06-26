import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RedireccionInvalidaGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const origen = route.queryParamMap.get('origen');
    
    if (origen === 'backend') {
      return true;
    }

    return this.router.parseUrl('/');
  }
}
