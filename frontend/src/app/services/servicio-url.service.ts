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

  verificarUrl(url: string): Observable<any> {
    return this.http.get(`http://localhost:8080/api/URL/verificar`, {
      params: { url },
      responseType: 'text'
    });
  }

  acortarUrl(url: string): Observable<string> {
    return this.http.post('http://localhost:8080/api/URL/acortar', { url }, { responseType: 'text' });
  }

}
