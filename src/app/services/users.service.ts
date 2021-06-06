import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Pagination } from '../shared/interfaces/pagination.interface';
import { UserResponse } from '../shared/interfaces/user-response.interface';
import { UserModel } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }

  findAllUsers(): Observable<Pagination<UserResponse>> {
    return this.http.get<Pagination<UserResponse>>(environment.apiUrl + '/api/users');
  }

  create(userModel: UserModel) {
    return this.http.post(environment.apiUrl + '/api/users', userModel)
  }
}
