import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Injectable()
export class DatabaseInterceptor implements HttpInterceptor {

    onlyMethods = ['POST', 'PUT', 'PATCH']

    constructor(private dbService: NgxIndexedDBService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((e: HttpErrorResponse) => {
                if (e instanceof HttpErrorResponse && e.status === 0) {
                    // Comprobar si el metodo http cumple con los métodos declarado arriba
                    const supportedMethod = this.onlyMethods.includes(req.method)
                    if (supportedMethod) {

                        // Captura del endpoint
                        const apiUrl = req.url;

                        // Captura del cuerpo que se está enviando
                        const body = req.body;

                        // Agregamos los datos a la base de datos local del navegador
                        this.dbService.add('dataToPost', { apiUrl, body, method: req.method });
                    }

                }
                return throwError(e);
            })
        );
    }
}