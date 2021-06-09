import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsersService } from './services/users.service';
import { Pagination } from './shared/interfaces/pagination.interface';
import { RequestProcess } from './shared/interfaces/request-process.interface';
import { UserResponse } from './shared/interfaces/user-response.interface';
import { SyncService } from './shared/services/sync.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  users: Pagination<UserResponse>;
  formUser: FormGroup;

  connectionStatus$: Observable<boolean>;
  runningSync$: Observable<boolean>;

  requestProcess: RequestProcess;
  total = 0;

  constructor(
    private usersService: UsersService,
    private fb: FormBuilder,
    private syncService: SyncService
  ) { }

  subject$ = new Subject();
  sync = true;

  ngOnInit(): void {
    this.createFormUser();
    this.getUsers();
    this.enableSync();
    this.listenData();
    this.listenConnectionStatus();
    this.listenRunningSync();
  }

  listenRunningSync(): void {
    this.runningSync$ = this.syncService.getRunningSync();
  }

  listenConnectionStatus() {
    this.connectionStatus$ = this.syncService.getListenerConnection();
  }


  listenData(): void {
    this.syncService.getSyncedData()
      .pipe(takeUntil(this.subject$))
      .subscribe(response => {
        this.requestProcess = response;
        this.total = (this.requestProcess.success + this.requestProcess.failed) * 100 / this.requestProcess.total;
      })
  }

  enableSync(): void {
    this.sync = true;
    this.syncService.enableSync();
  }

  syncManual() {
    this.syncService.runSync();
  }

  ngOnDestroy(): void {
    this.subject$.next();
    this.subject$.complete();
  }

  destroyListener() {
    this.syncService.disabledSync();
    this.sync = false;
  }

  createFormUser(): void {
    this.formUser = this.fb.group({
      name: ['Oscar', Validators.required],
      job: ['Web Dev', Validators.required]
    });
  }

  getUsers(): void {
    this.usersService.findAllUsers().subscribe(users => {
      this.users = users;
    })
  }

  saveUser(): void {
    if (this.formUser.valid) {
      this.usersService.create(this.formUser.value).subscribe(response => {
        /*    alert('fue ok'); */
      });
    }
  }



}
