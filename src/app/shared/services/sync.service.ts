import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from, Observable, of, Subject } from 'rxjs';
import { catchError, concatMap, tap } from 'rxjs/operators';
import { RequestProcess } from '../interfaces/request-process.interface';
import PouchDB from 'pouchdb-browser';

@Injectable({ providedIn: 'root' })
export class SyncService {

    private response$ = new Subject<RequestProcess>();
    private readonly db: PouchDB.Database<{}>;

    private hasInternetAccess = false;
    private internetAccess$ = new BehaviorSubject<boolean>(false);
    private runningSync$ = new BehaviorSubject<boolean>(false);
    private enableSyncStatus = false;

    constructor(private http: HttpClient) {
        this.db = new PouchDB('DATABASE');
        this.listenConnection();
    }

    get hasNetworkConnection(): boolean {
        return this.hasInternetAccess;
    }

    enableSync() {
        this.enableSyncStatus = true;
    }

    private listenConnection(): void {
        const hasConnection = navigator.onLine;
        this.hasInternetAccess = hasConnection;
        this.internetAccess$.next(hasConnection);

        addEventListener('online', () => {
            this.hasInternetAccess = true;
            this.internetAccess$.next(true);

            if (this.enableSyncStatus) {
                this.runSync();
            }
        });

        addEventListener('offline', () => {
            this.hasInternetAccess = false;
            this.internetAccess$.next(false);
        });
    }

    async runSync() {
        // Aqui se almacena un arreglo de objetos.
        const docs = await this.db.allDocs({ include_docs: true });
        const records = docs.rows.map(row => row.doc);
        records.length > 0 && this.runningSync$.next(true);

        // Total de peticiones por hacer
        const total = docs.total_rows;

        // Peticiones fallidas
        let failed = 0;

        // Peticiones existosas
        let success = 0;

        // El arreglo de objeto debe ir en un observable from para iterar uno por uno
        from(records).pipe(
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
            this.db.remove(dbItem._id, dbItem._rev);
        }, () => { }, () => this.runningSync$.next(false));
    }

    async saveDataToDb(apiUrl: string, method: string, body: any) {
        await this.db.put({
            _id: new Date().getUTCMilliseconds().toString(),
            apiUrl,
            method,
            body
        });
    }

    disabledSync(): void {
        this.enableSyncStatus = false;
    }

    getListenerConnection(): Observable<boolean> {
        return this.internetAccess$.asObservable();
    }

    getRunningSync(): Observable<boolean> {
        return this.runningSync$.asObservable();
    }

    getSyncedData(): Observable<RequestProcess> {
        return this.response$.asObservable();
    }

    private makeRequest(method: string, url: string, body: any) {
        return this.http.request(method, url, { body });
    }

}