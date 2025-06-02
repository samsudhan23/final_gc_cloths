import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { Menubar } from 'primeng/menubar';
import { AuthenticationService } from '../../../pages/service/authentication.service';
import * as AOS from 'aos';
import { UserFooterComponent } from '../user-footer/user-footer.component';

@Component({
  selector: 'app-user-layout',
  imports: [CommonModule, Menubar, BadgeModule, AvatarModule, RouterModule,UserFooterComponent],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent {

  responsiveOptions: any[] | undefined;

  items = [
    {
      label: 'Home',
      icon: 'pi pi-home',
    },
    {
      label: 'Shop',
      icon: 'pi pi-home',
    },
    {
      label: 'Category',
      icon: 'pi pi-search',
      // badge: '3',
      items: [
        {
          label: 'Shirt',
          icon: 'pi pi-bolt',
          // shortcut: '⌘+S',
        },
        {
          label: 'T-Shirt',
          icon: 'pi pi-server',
          // shortcut: '⌘+B',
        },
        {
          separator: true,
        },
        {
          label: 'Jeans',
          icon: 'pi pi-pencil',
          // shortcut: '⌘+U',
        },
      ],
    },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private auth: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (user?.role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (user?.role === 'user') {
      this.router.navigate(['/user']);
    }
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({ disable: 'mobile', duration: 1200, });
      AOS.refresh();
      // this.changeSlide();
    }

    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ]
  }

  gotoPages(label: string) {
    console.log('label: ', label);
    if (label == 'Shop') {
      this.router.navigate(['/user/shop']);
    }
    else if (label == 'Home') {
      this.router.navigate(['/user/home']);
    }
  }
}
