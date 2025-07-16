import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioURLService {

  private apiUrl = 'https://acortadorurlonline-production.up.railway.app/api/URL';
  
  archivoSeleccionado?: File;

  constructor(private http: HttpClient) {}

  // Método para poderse comunicar con el back y obtener el nombre del usuario
  getUsuario(): Observable<string> {
    return this.http.get('https://acortadorurlonline-production.up.railway.app/api/URL', {
      responseType: 'text',
      withCredentials: true
    });
  }

  // Método para poderse comunicar con el back y obtener el correo del usuario
  getCorreo(): Observable<string> {
    return this.http.get('https://acortadorurlonline-production.up.railway.app/api/URL/ver', {
      responseType: 'text',
      withCredentials: true
    });
  }

  // Método para poderse comunicar con el back y obtener el contraseña del usuario
  getContrasena(): Observable<string> {
    return this.http.get('https://acortadorurlonline-production.up.railway.app/api/URL/con', {
      responseType: 'text',
      withCredentials: true
    });
  }

  // Método para poderse comunicar con el back y verificar que la url es funcional y accesible
  verificarUrl(url: string): Observable<string> {
    const urlCodificada = encodeURIComponent(url);
    return this.http.get(`https://acortadorurlonline-production.up.railway.app/api/URL/verificar?url=${urlCodificada}`, {
      responseType: 'text',
      withCredentials: true
    });
  }

  // Método para poderse comunicar con el back y generar una url acortada en base a la url original
  acortarUrl(url: string, correo: string): Observable<string> {
    return this.http.post('https://acortadorurlonline-production.up.railway.app/api/URL/acortar', { url, correo }, { responseType: 'text', withCredentials: true });
  }

  // Método para poderse comunicar con el back y crear un usuario que necesite verificarse
  registrarse(nombre: string, correo: string, contrasena: string): Observable<string> {
    const body = { nombre, correo, contrasena };
    return this.http.post('https://acortadorurlonline-production.up.railway.app/api/URL/registrarUsuario', body, { responseType: 'text', withCredentials: true });
  }

  // Método para poderse comunicar con el back y acceder el usuario a la web en caso de que sus datos coincidan
  acceder(correo: string, contrasena: string): Observable<string> {
    const body = { correo, contrasena };
    return this.http.post('https://acortadorurlonline-production.up.railway.app/api/URL/accederUsuario', body, { responseType: 'text' });
  }

  // Método para poderse comunicar con el back y cerrar sesión eliminando los datos en el navegador del usuario
  logout(): Observable<string> {
    return this.http.post('https://acortadorurlonline-production.up.railway.app/api/URL/logout', {}, {
      responseType: 'text',
      withCredentials: true
    });
  }

  // Método para poderse comunicar con el back y obtener todas las urls que esten asociados al usuairo que esté en la sesión
  getUrlsDelUsuario(correo: string): Observable<any[]> {
    return this.http.get<any[]>(`https://acortadorurlonline-production.up.railway.app/api/URL/urls-usuario?correo=${correo}`, {
      withCredentials: true
    });
  }

  // Método para poderse comunicar con el back y variar el número de usos de la url acortada por los nuevos introducidos por el usuario
  actualizarUsos(shortId: string, usos: number): Observable<string> {
    return this.http.put(`https://acortadorurlonline-production.up.railway.app/api/URL/actualizar-usos/${shortId}`, { usos }, { responseType: 'text', withCredentials: true });
  }

  // Método para poderse comunicar con el back y eliminar la url acortada seleccionada
  eliminarUrl(shortId: string): Observable<string> {
    return this.http.delete(`https://acortadorurlonline-production.up.railway.app/api/URL/eliminar/${shortId}`, { responseType: 'text', withCredentials: true });
  }

  private haAcortado: boolean = false;

  // Método para poderse comunicar con el back y marcar que el usuario de la sesión haya acortado una url
  marcarComoAcortado() {
    this.haAcortado = true;
  }

  // Método para poderse comunicar con el back y verificar que el usuario de la sesión haya acortado al menos una url
  haAcortadoAlMenosUna(): boolean {
    return this.haAcortado;
  }

  // Método para poderse comunicar con el back y obtener los datos del usuario de la sesión
  obtenerContrasenaUsuario(correo: string): Observable<string> {
    return this.http.get(`https://acortadorurlonline-production.up.railway.app/api/URL/con?correo=${correo}`, {
      responseType: 'text',
      withCredentials: true
    });
  }

  // Método para poderse comunicar con el back y actualizar los datos del usuario de la sesión por los nuevos introducidos
  actualizarDatosUsuario(datos: { nombre: string, correo: string, contrasena: string }): Observable<{ token: string }> {
    return this.http.put<{ token: string }>(
      'https://acortadorurlonline-production.up.railway.app/api/URL/usuario/actualizar',
       datos,
      {
        withCredentials: true
      }
    );
  }

  // Método para poderse comunicar con el back y verificar el usuario que ha solicitado crear la cuenta
  verificarUsuario(token: string): Observable<string> {
    return this.http.get(`https://acortadorurlonline-production.up.railway.app/api/URL/verificarUsuario?token=${token}`, {
      responseType: 'text',
      withCredentials: true
    });
  }

  // Método para poderse comunicar con el back y enviar un correo al usuario que solicite recuperar su contraseña
  enviarCorreoRecuperar(correo: string): Observable<any> {
    return this.http.post('https://acortadorurlonline-production.up.railway.app/api/URL/enviarCorreoRecuperacion', { correo }, { responseType: 'text', withCredentials: true });
  }

  // Método para poderse comunicar con el back y cambiar la contraseña del usuario que solicite recuperar la contraseña
  restablecerContrasena(datos: { token: string, contrasena: string }): Observable<string> {
    return this.http.put(
      'https://acortadorurlonline-production.up.railway.app/api/URL/usuario/restablecerContrasena',
      datos,
      {
        withCredentials: true,
        responseType: 'text'
      }
    );
  }

}
