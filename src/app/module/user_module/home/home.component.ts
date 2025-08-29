import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import * as AOS from 'aos';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../pages/service/authentication.service';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Carousel } from 'primeng/carousel';
import { AdminProductService } from '../../admin_module/service/productService/admin-product.service';
import { ToastrService } from 'ngx-toastr';
import { TabsModule } from 'primeng/tabs';
import { CategoryService } from '../../admin_module/service/category/category.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BadgeModule, AvatarModule, InputTextModule, Carousel, TabsModule, ButtonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  isCartOpen: boolean = false
  cartCount = 0;
  products: any | undefined;
  productList: any;

  responsiveOptions: any[] | undefined;

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
  categoryList: any[] = [];
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private auth: AuthenticationService,
    private router: Router,
    private productService: AdminProductService,
    private toast: ToastrService,
    private category: CategoryService,
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
      this.getCategoryList();
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

  index = 0; // Add this as a property of your component
  maxSlides = 2;
  changeSlide() {
    const slides = document.querySelectorAll(".hero-slide") as NodeListOf<HTMLElement>;

    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }

    if (this.index < 0) {
      this.index = slides.length - 1;
    }

    if (this.index > slides.length - 1) {
      this.index = 0;
    }

    slides[this.index].style.display = "block";

    this.index++;
    if (this.index >= this.maxSlides) {
      return; // Stop recursion here
    }
    setTimeout(() => this.changeSlide(), 2000);
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  getCategoryList() {
    this.category.getCategoriesMasterList().subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        // this.categoryList = res.result;
        const categories = res.result || [];
        // Prepend the 'All' option
        this.categoryList = [
          { _id: 'all', categoryName: 'All' },
          ...categories
        ];
      }
    });
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
      console.log('this.filteredProducts: ', this.filteredProducts);
    } else {
      this.filteredProducts = this.productList.filter((product: any) => product.category.categoryName === this.selectedCategory);
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterProducts();
  }

  addToCart(product: any) {
    console.log("Added to cart:", product);
    // your cart logic here
  }

  addToWishlist(product: any) {
    console.log("Added to wishlist:", product);
    // your wishlist logic here
  }

  toggleWishlist(product: any) {
    product.isWishlisted = !product.isWishlisted;
  }

  selectedProduct: any = null;

  openQuickView(product: any) {
    this.selectedProduct = product;
    console.log('this.selectedProduct: ', this.selectedProduct);
  }

  closeQuickView() {
    this.selectedProduct = null;
  }

  buyNow(product: any) {
    console.log('product: ', product);
  }

  viewDetails(product: any) {
    console.log('product: ', product);
   this.router.navigate(['user/product-details'], { state: { product,allProducts: this.filteredProducts} });
  }

}
