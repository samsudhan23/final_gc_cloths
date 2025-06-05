import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { Menubar } from 'primeng/menubar';
import { AuthenticationService } from '../../../pages/service/authentication.service';
import * as AOS from 'aos';
import { UserFooterComponent } from '../user-footer/user-footer.component';
import { CategoryService } from '../../admin_module/service/category/category.service';

@Component({
  selector: 'app-user-layout',
  imports: [CommonModule, Menubar, BadgeModule, AvatarModule, RouterModule, UserFooterComponent],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent {

  responsiveOptions: any[] | undefined;

  items: any = [
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
      items: []
      // badge: '3',
      // items: [
      //   {
      //     label: 'Shirt',
      //     icon: 'pi pi-bolt',
      //     // shortcut: '⌘+S',
      //   },
      //   {
      //     label: 'T-Shirt',
      //     icon: 'pi pi-server',
      //     // shortcut: '⌘+B',
      //   },
      //   {
      //     separator: true,
      //   },
      //   {
      //     label: 'Jeans',
      //     icon: 'pi pi-pencil',
      //     // shortcut: '⌘+U',
      //   },
      // ],
    },
  ];


  categoryList: any[] = [];
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private auth: AuthenticationService,
    private category: CategoryService,
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
      this.getCategoryList();
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

  getCategoryList() {
    this.category.getCategoriesMasterList().subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.categoryList = res.result;

        const dynamicCategories = this.categoryList.map((cat: any) => ({
          label: cat.categoryName,
          icon: 'pi pi-tag', // Change icon if needed
          command: () => this.gotoPages(cat._id) // Assuming _id is the unique identifier
        }));

        // Rebuild the items with dynamic categories
        this.items = [
          {
            label: 'Home',
            icon: 'pi pi-home',
          },
          {
            label: 'Shop',
            icon: 'pi pi-shopping-cart',
          },
          {
            label: 'Category',
            icon: 'pi pi-th-large',
            items: dynamicCategories
          }
        ];
      }
    });
  }


  gotoPages(label: string) {
    console.log('label: ', label);
    if (label == 'Shop') {
      this.router.navigate(['/user/shop']);
    }
    else if (label == 'Home') {
      this.router.navigate(['/user/home']);
    }
    // else if (label == 'Category') {
    //   this.router.navigate(['/user/shop']);
    // }
  }


}
