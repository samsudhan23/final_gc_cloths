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

@Component({
  selector: 'app-categorywiseproduct',
  imports: [CommonModule, BadgeModule, AvatarModule, InputTextModule, TabsModule, ButtonModule, RouterModule],
  templateUrl: './categorywiseproduct.component.html',
  styleUrl: './categorywiseproduct.component.scss'
})
export class CategorywiseproductComponent {

  selectedCategory: string = 'All';
  filteredProducts: any[] = [];
  categoryList: any[] = [];
  productList: any;
  selectedGender: string = 'Male';

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private productService: AdminProductService,
    private encryptionService: EncryptionService,
    private toast: ToastrService, private router: Router,
    private route: ActivatedRoute
  ) {

  }
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({ disable: 'mobile', duration: 1200, });
      AOS.refresh();
      // this.getProduct();
      this.route.paramMap.subscribe(params => {
      this.selectedGender = params.get('genderName') || '';
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
        this.productList = allProducts.filter(
          (item: any) =>
            item.gender?.genderName?.toLowerCase() ===
            this.selectedGender.toLowerCase()
        );
      } else {
        this.productList = allProducts; // If no gender selected, show all
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
    // Encrypt product ID and pass it in URL
    const encryptedId = this.encryptionService.encrypt(product._id);
    this.router.navigate(['user/product-details', encryptedId]);
  }

  goBack() {
    this.router.navigate(['user/home']);
  }

}
