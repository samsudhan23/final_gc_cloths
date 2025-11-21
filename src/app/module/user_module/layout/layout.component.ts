import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { UserFooterComponent } from '../user-footer/user-footer.component';
import { AuthenticationService } from '../../../pages/service/authentication.service';
import { CategoryService } from '../../admin_module/service/category/category.service';
import * as AOS from 'aos';
import { ButtonModule } from 'primeng/button';
import { Sidebar, SidebarModule } from 'primeng/sidebar';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Gender } from '../../../shared/interface/gender';
import { Tooltip } from 'primeng/tooltip';
import { Popover, PopoverModule } from 'primeng/popover';
import { Subscription } from 'rxjs';
import { CartService } from '../../admin_module/service/cartService/cart.service';
import { apiResponse } from '../../../shared/interface/response';
import { WishlistService } from '../../admin_module/service/wishlistService/wishlist.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, PopoverModule, BadgeModule, Tooltip, OverlayBadgeModule, AvatarModule, RouterModule, UserFooterComponent, SidebarModule, ButtonModule, RippleModule, StyleClassModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  animations: [
    // trigger('slideInOut', [
    //   transition(':enter', [
    //     style({ transform: 'translateX(-100%)' }),
    //     animate('300ms ease-in', style({ transform: 'translateX(0%)' }))
    //   ]),
    //   transition(':leave', [
    //     animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))
    //   ])
    // ])
  ]
})
export class LayoutComponent {
  responsiveOptions: any[] | undefined;

  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  @ViewChild('op') op!: Popover;

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }

  sidebarVisible: boolean = false;
  sideSubMenu: boolean = false;

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
  genderList: Gender[] = [];
  maleList: Gender[] = [];
  categoryList: any[] = [];
  members: any = [{ name: 'Profile', image: '../../../../assets/images/Avatar/icons8-cat-profile-48.png' }];
  selectedMember = null;
  private sub!: Subscription;
  cartLength: any = 0;
  WishlistLength: any = 0;
  allCartList: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private auth: AuthenticationService,
    private category: CategoryService,
    private router: Router,
    private cart: CartService,
    private wishlistService: WishlistService
  ) { }

  ngOnInit() {
    this.cart.updateCartLength$.subscribe((res: any) => {
      this.cartLength = res
    })
    this.wishlistService.updateWishlistLength$.subscribe((res: any) => {
      this.WishlistLength = res
      console.log('this.WishlistLength: ', this.WishlistLength);
    })
    this.sub = this.auth.currentUser$.subscribe(user => {
      if (user?.role === 'admin') {
        // Only navigate if not already on admin route
        if (!this.router.url.startsWith('/admin')) {
          this.router.navigate(['/admin']);
        }
      } else if (user?.role === 'user') {
        // Only navigate if not already on user route (prevents redirect on page refresh)
        if (!this.router.url.startsWith('/user')) {
          this.router.navigate(['/user']);
        }
        // Add logout option if not already present
        if (!this.members.some((m: any) => m.name === 'Logout')) {
          this.members.push({ name: 'Logout', image: '../../../../assets/images/Avatar/logout.png' })
        }
        // Refresh cart length after login
        setTimeout(() => {
          this.getCartLength();
        }, 500); // Small delay to ensure guest cart merge completes
      }
    });
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
    this.genderData();
    this.getCartLength();
  }
  getCartLength() {
    const roleString = localStorage.getItem('role');
    const parse = roleString ? JSON.parse(roleString) : null;
    const userId = parse?.id || parse?._id;
    
    if (userId) {
      // Logged-in user: Get from API with userId filter
      this.cart.getCartList(userId).subscribe((res: apiResponse) => {
        if (res?.code === 200 && res?.success === true) {
          this.cartLength = (res.result || []).map((item: any) => item?.quantity || 0).reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0)
          // Update the BehaviorSubject so other components can subscribe
          this.cart.getLengthOfCart(this.cartLength);
        }
      })
    } else {
      // Guest user: Get from localStorage
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      this.allCartList = guestCart;
      console.log('guestCart: ', guestCart);
      this.cartLength = this.allCartList.map(item => item.quantity).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
      // Update the BehaviorSubject for guest cart as well
      this.cart.getLengthOfCart(this.cartLength);
    }
  }
  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  toggle(event: any) {
    this.op.toggle(event);
  }

  selectMember(member: any) {
    this.selectedMember = member;
    this.op.hide();
    if (member.name === 'Logout') {
      this.logout()
    } else if (member.name === 'Profile') {
      this.router.navigate(['/user/user-profile'])
    }
  }
  getCategoryList() {
    this.category.getCategoriesMasterList().subscribe((res: apiResponse) => {
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

  genderData() {
    this.category.getGenderList().subscribe((res: apiResponse) => {
      if (res.code === 200 && res.success === true) {
        this.genderList = res.navData
        // this.maleList = res.navData.filter((item: Gender) => item._id === "680bd68af7f32e61016eb82f")
        // console.log('this.maleList: ', this.maleList);
      }
    })
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

  openNav() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  openSubNav(item: any) {
    this.sideSubMenu = !this.sideSubMenu;
    this.router.navigate(['user/categorywiseproduct', item.genderName]);
  }
  movedToMenuPages(pages: String) {
    if (pages === 'wishlist') {
      this.router.navigate(['/user/wishlist'])
    }
    else if (pages === 'cart') {
      this.router.navigate(['/user/cart'])
    }
  }
  logout() {
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.router.navigate(['/user/home']).then(() => {
      window.location.reload(); // reloads Angular app completely
    });
  }
}
