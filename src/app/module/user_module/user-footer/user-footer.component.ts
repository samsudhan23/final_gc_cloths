import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-footer',
  imports: [],
  templateUrl: './user-footer.component.html',
  styleUrl: './user-footer.component.scss'
})
export class UserFooterComponent {
constructor(private router: Router,) {}
  contactus(){
    this.router.navigate(['user/contactus']);
  }

  aboutus(){
    this.router.navigate(['user/about']);
  }

}
