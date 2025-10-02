import { Component } from '@angular/core';
import { SignInComponent } from '../../../pages/auth/sign-in/sign-in.component';
import { AuthenticationService } from '../../../pages/service/authentication.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  imports: [SignInComponent, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  isLoggedIn: boolean = true;

  constructor(private auth: AuthenticationService,) {

  }

  ngOnInit() {
    const rolePeremission = this.auth?.getCurrentUser()
    if (rolePeremission?.role === 'user') {
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }
  }
}
