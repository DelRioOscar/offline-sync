import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxIndexedDBModule } from 'ngx-indexed-db';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatabaseInterceptor } from './interceptors/database.interceptor';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxIndexedDBModule.forRoot({
      name: 'MyDB',
      version: 1,
      objectStoresMeta: [{
        store: 'dataToPost',
        storeConfig: {
          keyPath: 'id',
          autoIncrement: true
        },
        storeSchema: [
          { name: 'apiUrl', keypath: 'apiUrl', options: { unique: false } },
          { name: 'method', keypath: 'method', options: { unique: false } },
          { name: 'body', keypath: 'body', options: { unique: false } }
        ]
      }]
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: DatabaseInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
