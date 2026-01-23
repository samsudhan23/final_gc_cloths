import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { UserFooterComponent } from '../user-footer/user-footer.component';
import { AuthenticationService } from '../../../pages/service/authentication.service';
import { CategoryService } from '../../admin_module/service/category/category.service';
import { AdminProductService } from '../../admin_module/service/productService/admin-product.service';
import { EncryptionService } from '../../../shared/service/encryption.service';
import * as AOS from 'aos';
import { ButtonModule } from 'primeng/button';
import { Sidebar, SidebarModule } from 'primeng/sidebar';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Gender } from '../../../shared/interface/gender';
import { Tooltip } from 'primeng/tooltip';
import { Popover, PopoverModule } from 'primeng/popover';
import { Subscription, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CartService } from '../../admin_module/service/cartService/cart.service';
import { apiResponse } from '../../../shared/interface/response';
import { WishlistService } from '../../admin_module/service/wishlistService/wishlist.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, PopoverModule, BadgeModule, Tooltip, OverlayBadgeModule, AvatarModule, RouterModule, UserFooterComponent, SidebarModule, ButtonModule, RippleModule, StyleClassModule, FormsModule],
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
  searchModalVisible: boolean = false;

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

  // Search properties
  searchQuery: string = '';
  searchSuggestions: any[] = [];
  showSuggestions: boolean = false;
  allProducts: any[] = [];
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private auth: AuthenticationService,
    private category: CategoryService,
    private productService: AdminProductService,
    private encryptionService: EncryptionService,
    private router: Router,
    private route: ActivatedRoute,
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
    this.loadAllProducts();
    this.setupSearch();
  }

  loadAllProducts() {
    this.productService.getProductlist().subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.allProducts = res.result || [];
      }
    });
  }

  setupSearch() {
    // Debounce search input to avoid too many API calls
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((query: string) => {
      if (query && query.trim().length >= 2) {
        this.searchProducts(query);
      } else {
        this.searchSuggestions = [];
        this.showSuggestions = false;
      }
    });
  }

  onSearchInput(event: any) {
    const query = event.target.value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  searchProducts(query: string) {
    const searchTerm = query.toLowerCase().trim();
    if (searchTerm.length < 2) {
      this.searchSuggestions = [];
      this.showSuggestions = false;
      return;
    }

    // Filter products based on search term
    this.searchSuggestions = this.allProducts.filter((product: any) => {
      const productName = (product.productName || '').toLowerCase();
      const categoryName = (product.category?.categoryName || '').toLowerCase();
      const genderName = (product.gender?.genderName || '').toLowerCase();
      const description = (product.productDescription || '').toLowerCase();
      const tags = (product.tags || []).join(' ').toLowerCase();
      const sku = (product.sku || '').toLowerCase();

      return productName.includes(searchTerm) ||
             categoryName.includes(searchTerm) ||
             genderName.includes(searchTerm) ||
             description.includes(searchTerm) ||
             tags.includes(searchTerm) ||
             sku.includes(searchTerm);
    }).slice(0, 8); // Limit to 8 suggestions

    this.showSuggestions = this.searchSuggestions.length > 0;
  }

  onSearchSubmit() {
    if (this.searchQuery && this.searchQuery.trim().length >= 2) {
      this.router.navigate(['/user/productlists'], {
        queryParams: { search: this.searchQuery.trim() }
      });
      this.showSuggestions = false;
      this.searchQuery = '';
    }
  }

  selectSuggestion(product: any) {
    const encryptedId = this.encryptionService.encrypt(product._id);
    this.router.navigate(['/user/product-details', encryptedId]);
    this.showSuggestions = false;
    this.searchQuery = '';
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchSuggestions = [];
    this.showSuggestions = false;
  }

  onSearchFocus() {
    if (this.searchQuery && this.searchQuery.trim().length >= 2) {
      this.showSuggestions = this.searchSuggestions.length > 0;
    }
  }

  onSearchBlur() {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  openSearchModal() {
    this.searchModalVisible = true;
    // Focus search input after modal opens
    setTimeout(() => {
      const input = document.querySelector('.search-input-modal') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);
  }

  closeSearchModal() {
    this.searchModalVisible = false;
    this.showSuggestions = false;
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
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
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

  navigateToProfile() {
    this.router.navigate(['/user/user-profile']);
    this.sidebarVisible = false;
  }

  hasLogoutOption(): boolean {
    return this.members.some((m: any) => m.name === 'Logout');
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
    this.router.navigate(
      ['user/categorywiseproduct'],
      { queryParams: { gender: item.genderName } }
    );
    this.sidebarVisible = !this.sidebarVisible;
    // this.router.navigate(['user/categorywiseproduct', item.genderName]);
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
