import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioURLService {

  private apiUrl = 'http://localhost:8080/api/URL';
  
  archivoSeleccionado?: File;

  constructor(private http: HttpClient) {}

  getUsuario(): Observable<string> {
    return this.http.get('http://localhost:8080/api/URL', {
      responseType: 'text',
      withCredentials: true
    });
  }

  getCorreo(): Observable<string> {
    return this.http.get('http://localhost:8080/api/URL/ver', {
      responseType: 'text',
      withCredentials: true
    });
  }

  getContrasena(): Observable<string> {
    return this.http.get('http://localhost:8080/api/URL/con', {
      responseType: 'text',
      withCredentials: true
    });
  }

  verificarUrl(url: string): Observable<string> {
    const urlCodificada = encodeURIComponent(url);
    return this.http.get(`http://localhost:8080/api/URL/verificar?url=${urlCodificada}`, {
      responseType: 'text'
    });
  }

  acortarUrl(url: string, correo: string): Observable<string> {
    return this.http.post('http://localhost:8080/api/URL/acortar', { url, correo }, { responseType: 'text' });
  }

  registrarse(nombre: string, correo: string, contrasena: string): Observable<string> {
    const body = { nombre, correo, contrasena };
    return this.http.post('http://localhost:8080/api/URL/registrarUsuario', body, { responseType: 'text', withCredentials: true });
  }

  acceder(correo: string, contrasena: string): Observable<string> {
    const body = { correo, contrasena };
    return this.http.post('http://localhost:8080/api/URL/accederUsuario', body, { responseType: 'text', withCredentials: true });
  }

  logout(): Observable<string> {
    return this.http.post('http://localhost:8080/api/URL/logout', {}, {
      responseType: 'text',
      withCredentials: true
    });
  }

  getUrlsDelUsuario(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/URL/urls-usuario', {
      withCredentials: true
    });
  }

  actualizarUsos(shortId: string, usos: number): Observable<string> {
    return this.http.put(`http://localhost:8080/api/URL/actualizar-usos/${shortId}`, { usos }, { responseType: 'text' });
  }

  eliminarUrl(shortId: string): Observable<string> {
    return this.http.delete(`http://localhost:8080/api/URL/eliminar/${shortId}`, { responseType: 'text' });
  }

  private haAcortado: boolean = false;

  marcarComoAcortado() {
    this.haAcortado = true;
  }

  haAcortadoAlMenosUna(): boolean {
    return this.haAcortado;
  }

  getDatosUsuario(): Observable<{ nombre: string, correo: string, contrasena: string }> {
    return this.http.get<{ nombre: string, correo: string, contrasena: string }>(
      'http://localhost:8080/api/URL/usuario/datos',
      { withCredentials: true }
    );
  }

  actualizarDatosUsuario(datos: { nombre: string, contrasena: string }) {
    return this.http.put('http://localhost:8080/api/usuario/actualizar', datos, {
      withCredentials: true 
    });
  }

}
