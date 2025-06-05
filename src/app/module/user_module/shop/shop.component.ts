import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../../pages/service/authentication.service';
import { AdminProductService } from '../../admin_module/service/productService/admin-product.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as AOS from 'aos';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, BadgeModule, AvatarModule, InputTextModule,TabsModule, ButtonModule, RouterModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {

  isCartOpen: boolean = false
  cartCount = 0;
  products: any | undefined;
  productList: any;
  images: string[] = [
    'assets/images/basic/home1.webp',
    'assets/images/basic/home2.webp',
    'assets/images/basic/home3.webp'
  ];

  categories = [
    { name: 'All', id: 'Tab 1' },
    { name: 'T-Shirt', id: 'Tab 2' },
    { name: 'Shirt', id: 'Tab 3' },
    { name: 'Accessories', id: 'Tab 4' },
    { name: 'Footwear', id: 'Tab 5' },
  ];
  selectedCategory: string = 'All';
  filteredProducts: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private productService: AdminProductService,
    private toast: ToastrService,
  ) { }

  ngOnInit() {
    // const user = this.auth.getCurrentUser();
    // if (user?.role === 'admin') {
    //   this.router.navigate(['/admin']);
    // } else if (user?.role === 'user') {
    //   this.router.navigate(['/user']);
    // }
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({ disable: 'mobile', duration: 1200, });
      AOS.refresh();
      this.getProduct();
      // this.changeSlide();
    }
  }

  getProduct() {
    this.productService.getProductlist().subscribe((res: any) => {
      this.productList = res.result;
      this.filterProducts();
    }, (error: any) => {
      this.toast.warning(error.error.message);
    })
  }

  filterProducts(): void {
    if (this.selectedCategory === 'All') {
      this.filteredProducts = this.productList;
    } else {
      this.filteredProducts = this.productList.filter((product: any) => product.category.categoryName === this.selectedCategory
      );
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterProducts();
  }

}
