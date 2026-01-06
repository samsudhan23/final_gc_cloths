import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminProductService } from '../../admin_module/service/productService/admin-product.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import * as AOS from 'aos';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { QuickViewComponent } from '../../../shared/components/quick-view/quick-view.component';
import { WishlistService } from '../../admin_module/service/wishlistService/wishlist.service';

@Component({
  selector: 'app-categorywiseproduct',
  imports: [CommonModule, BadgeModule, AvatarModule, InputTextModule, TabsModule, ButtonModule, RouterModule,QuickViewComponent],
  templateUrl: './categorywiseproduct.component.html',
  styleUrl: './categorywiseproduct.component.scss'
})
export class CategorywiseproductComponent {

  selectedCategory: any;
  filteredProducts: any[] = [];
  categoryList: any[] = [];
  productList: any;
  selectedGender: string = 'Men';
  wishListData: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private productService: AdminProductService,
    private encryptionService: EncryptionService,
    private toast: ToastrService, private router: Router,
    private route: ActivatedRoute,
    private wishlistService: WishlistService,
  ) {

  }
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({ disable: 'mobile', duration: 1200, });
      AOS.refresh();
      // this.getProduct();
    //   this.route.paramMap.subscribe(params => {
    //   this.selectedGender = params.get('genderName') || '';
    //   console.log('this.selectedGender: ', this.selectedGender);
    //   this.selectedCategory = params.get('categoryName') || '';
    //   console.log('this.selectedCategory: ', this.selectedCategory);
    //   this.getProduct();
    // });
    this.route.queryParamMap.subscribe(params => {

    this.selectedGender = params.get('gender') ?? '';
    this.selectedCategory = params.get('category') ?? '';

    console.log('Gender:', this.selectedGender);
    console.log('Category:', this.selectedCategory);

    this.getProduct();
  });
      // this.changeSlide();
    }
  }


  getProduct() {
    this.productService.getProductlist().subscribe((res: any) => {
      const allProducts = res.result;
      // Filter based on selectedGender
      if (this.selectedGender && this.selectedGender.trim() !== '') {
        this.filteredProducts = allProducts.filter(
          (item: any) =>
            item.gender?.genderName?.toLowerCase() ===
            this.selectedGender.toLowerCase()
        );
         this.getWishlistdetails();
      }
      else if (this.selectedCategory && this.selectedCategory.trim() !== '') {
        this.filteredProducts = allProducts.filter(
          (item: any) =>
            item.category?.categoryName?.toLowerCase() ===
            this.selectedCategory.toLowerCase()
        );
         this.getWishlistdetails();
      }
       else {
        this.filteredProducts = allProducts; // If no gender selected, show all
      }
      console.log('Filtered Products:', this.productList);
    }, (error: any) => {
      this.toast.warning(error.error.message);
    })
  }

  // filterProducts(): void {
  //   if (this.selectedCategory === 'All') {
  //     this.filteredProducts = this.productList;
  //     console.log('this.filteredProducts: ', this.filteredProducts);
  //   } else {
  //     this.filteredProducts = this.productList.filter((product: any) => product.category.categoryName === this.selectedCategory);
  //   }
  // }

  addToCart(product: any) {
    console.log("Added to cart:", product);
    // your cart logic here
  }

  addToWishlist(product: any) {
    console.log("Added to wishlist:", product);
    // your wishlist logic here
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

  buyNow(product: any) {
    console.log('product: ', product);
  }

  viewDetails(product: any) {
    console.log('product: ', product);
    // Encrypt product ID and pass it in URL
    const encryptedId = this.encryptionService.encrypt(product._id);
    this.router.navigate(['user/product-details', encryptedId]);
  }

  goBack() {
    this.router.navigate(['user/home']);
  }

  goBacktoProducts() {
    this.router.navigate(['user/categorywiseproduct']);
  }

}
