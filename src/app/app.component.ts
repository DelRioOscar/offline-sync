import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsersService } from './services/users.service';
import { Pagination } from './shared/interfaces/pagination.interface';
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

  constructor(
    private usersService: UsersService,
    private fb: FormBuilder,
    private requestService: SyncService
  ) { }

  subject$ = new Subject();
  sync = true;

  ngOnInit(): void {
    this.createFormUser();
    this.getUsers();
    this.enableSync();
    this.listenData();

  }

  listenData(): void {
    this.requestService.getSyncedData().subscribe(response => {
      console.log(response);
    })
  }

  enableSync(): void {
    this.sync = true;
    this.requestService.enableSync();
  }

  syncManual() {
    this.requestService.runSync();
  }

  ngOnDestroy(): void {

  }

  destroyListener() {
    this.sync = false;
    this.requestService.destroySync();
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
