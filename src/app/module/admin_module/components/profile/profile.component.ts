import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../service/user/user.service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  defaultAvatar = 'assets/images/Avatar/default.jpg';
  usersList: any[] = [];
  constructor(
    private userService: UserService,
    private toast: ToastrService,
  ) { }
  user_Email: any;
  user_Name: any;
  filterUsers: any;
  ngOnInit() {
    this.loadUsers();
    const data = this.userService.getUserFromLocalStorage();
    if (data) {
      this.user_Email = data.email;
      this.user_Name = data.email?.split('@')[0] || 'User'; // default name from email
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((res: any) => {
      this.usersList = res.result;
      let filterVal = this.usersList.filter(item => item.email == this.user_Email);
      this.filterUsers = filterVal[0];
    }, (error: any) => {
      console.log('error: ', error);
    })
  }

}
