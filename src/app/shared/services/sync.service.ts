import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { forkJoin, from, of, Subject } from 'rxjs';
import { catchError, concatMap, tap } from 'rxjs/operators';
import { RequestProcess } from '../interfaces/request-process.interface';

@Injectable({ providedIn: 'root' })
export class SyncService {

    private response$ = new Subject<RequestProcess>();
    private activateListener = false;

    constructor(
        private http: HttpClient,
        private dbService: NgxIndexedDBService
    ) { }

    enableSync() {
        if (!this.activateListener) {
            this.activateListener = true;
            addEventListener('online', (e: Event) => {
                this.runSync();
            });
        }
    }

    async runSync() {
        // Aqui se almacena un arreglo de objetos.
        const dataDb = await this.dbService.getAll('dataToPost').toPromise();

        // Total de peticiones por hacer
        const total = dataDb.length;

        // Peticiones fallidas
        let failed = 0;

        // Peticiones existosas
        let success = 0;

        // El arreglo de objeto debe ir en un observable from para iterar uno por uno
        from(dataDb).pipe(
            concatMap((item: any) =>
                forkJoin([this.makeRequest(item.method, item.apiUrl, item.body), of(item)]).pipe(
                    tap(() => success++),
                    catchError(error => {
                        failed++;
                        return of([error, item]);
                    })
                )
            )
        ).subscribe(([apiResponse, dbItem]) => {
            const requestProcess: RequestProcess = {
                total,
                failed,
                success,
                info: [apiResponse, dbItem]
            }
            this.response$.next(requestProcess);
            this.dbService.delete('dataToPost', dbItem.id);
        }, () => { });
    }

    destroySync() {
        removeEventListener('online', () => { })
    }

    getSyncedData() {
        return this.response$.asObservable();
    }


    private makeRequest(method: string, url: string, body: any) {
        return this.http.request(method, url, { body });
    }

}