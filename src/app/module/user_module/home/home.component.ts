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
import { WishlistService } from '../../admin_module/service/wishlistService/wishlist.service';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { QuickViewComponent } from '../../../shared/components/quick-view/quick-view.component';

declare function showAlert(): void;
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BadgeModule, AvatarModule, InputTextModule, Carousel, TabsModule, ButtonModule, RouterModule, QuickViewComponent],
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
  animated: any[] = [];

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
  activeIndex = 0;
  interval: any;
  wishListData: any[] = [];
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private auth: AuthenticationService,
    private router: Router,
    private productService: AdminProductService,
    private toast: ToastrService,
    private category: CategoryService,
    private wishlistService: WishlistService,
    private encryptionService: EncryptionService
  ) { }
  ngAfterViewInit(): void {
    showAlert();
    setTimeout(() => {
      AOS.init({
        duration: 800,
        once: true,
        easing: 'ease-out-cubic'
      });

      AOS.refresh(); // ⭐ important
    }, 300);
  }
  ngOnInit() {
    showAlert();
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

    // this.animated =
    //   [
    //     { "id": 1, "productName": "Bata Power Walk", "price": 45000, "images": "assets/images/Products/1 (1).avif" },
    //     { "id": 2, "productName": "Skechers Go Walk 1", "price": 67490, "images": "assets/images/Products/1 (2).avif" },
    //     { "id": 3, "productName": "Bata Power Walk", "price": 12000, "images": "assets/images/Products/1 (3).avif" },
    //     { "id": 4, "productName": "Skechers Flex Appeal", "price": 67490, "images": "assets/images/Products/2 (1).avif" },
    //     { "id": 5, "productName": "Fila Sport Max", "price": 12000, "images": "assets/images/Products/2 (2).avif" },
    //     { "id": 6, "productName": "Bata Power Walk", "price": 45000, "images": "assets/images/Products/2 (3).avif" },
    //     { "id": 7, "productName": "Skechers Go Walk 1", "price": 67490, "images": "assets/images/Products/1 (1).avif" },
    //     { "id": 8, "productName": "Bata Power Walk", "price": 12000, "images": "assets/images/Products/1 (2).avif" }
    //   ]
    // auto slide every 10s
    // this.interval = setInterval(() => this.next(), 5000);
  }

  getPositionClass(i: number): string {
    const total = this.animated.length;

    if (i === this.activeIndex) return 'active';
    if (i === (this.activeIndex - 1 + total) % total) return 'left1';
    if (i === (this.activeIndex - 2 + total) % total) return 'left2';
    if (i === (this.activeIndex + 1) % total) return 'right1';
    if (i === (this.activeIndex + 2) % total) return 'right2';

    return 'hidden';
  }

  next() {
    this.activeIndex = (this.activeIndex + 1) % this.animated.length;
  }

  prev() {
    this.activeIndex =
      (this.activeIndex - 1 + this.animated.length) % this.animated.length;
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
      if (this.productList && this.productList.length > 0) {
        this.animated = this.productList;
        this.interval = setInterval(() => this.next(), 5000);
        this.filterProducts();
        this.getWishlistdetails();
      }
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
      console.log('this.filteredProducts: ', this.filteredProducts);
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterProducts();
  }


  getWishlistdetails() {
    // Use centralized service method - service will update filteredProducts directly
    this.wishlistService.getWishlistDetailsAndUpdateProducts(this.filteredProducts, {
      onSuccess: (wishListData: any[]) => {
        this.wishListData = wishListData;
        // Service already updates filteredProducts with isWishlisted status
      },
      onError: (error: any) => {
        console.error('Error fetching wishlist:', error);
        this.wishListData = [];
      }
    });
  }

  addToCart(product: any, event: Event) {
    event.stopPropagation();
  }

  addToWishlist(product: any) {
    // your wishlist logic here
  }

  toggleWishlist(product: any, event: Event) {
    // Use centralized service method
    this.wishlistService.toggleWishlist(product, event, this.toast, (updated: boolean) => {
      if (updated) {
        // Refresh wishlist details after toggle
        this.getWishlistdetails();
      }
    });
  }

  selectedProduct: any = null;

  openQuickView(product: any, event: Event) {
    this.selectedProduct = product;
    event.stopPropagation();
  }

  closeQuickView() {
    this.selectedProduct = null;
  }

  viewDetails(product: any, data: string) {
    if (data == 'data') {
      // Encrypt product ID and pass it in URL
      const encryptedId = this.encryptionService.encrypt(product._id);
      this.router.navigate(['user/product-details', encryptedId]);
    }
  }

}
