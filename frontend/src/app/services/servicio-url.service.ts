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

  getDocumentos(): Observable<string> {
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }

  verificarUrl(url: string): Observable<string> {
    const urlCodificada = encodeURIComponent(url);
    return this.http.get(`http://localhost:8080/api/URL/verificar?url=${urlCodificada}`, {
      responseType: 'text'
    });
  }


  acortarUrl(url: string): Observable<string> {
    return this.http.post('http://localhost:8080/api/URL/acortar', { url }, { responseType: 'text' });
  }

  registrarse(nombre: string, correo: string, contrasena: string): Observable<string> {
    const body = { nombre, correo, contrasena };
    return this.http.post('http://localhost:8080/api/URL/registrarUsuario', body, { responseType: 'text' });
  }

  acceder(correo: string, contrasena: string): Observable<string> {
    const body = { correo, contrasena };
    return this.http.post('http://localhost:8080/api/URL/accederUsuario', body, { responseType: 'text' });
  }
}
