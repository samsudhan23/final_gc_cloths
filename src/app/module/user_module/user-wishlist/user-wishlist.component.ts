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
import { WishlistService } from '../../admin_module/service/wishlistService/wishlist.service';

@Component({
  selector: 'app-user-wishlist',
  imports: [CommonModule, BadgeModule, AvatarModule, InputTextModule, TabsModule, ButtonModule, RouterModule],
  templateUrl: './user-wishlist.component.html',
  styleUrl: './user-wishlist.component.scss'
})
export class UserWishlistComponent {
  selectedCategory: string = 'All';
  filteredProducts: any[] = [];
  categoryList: any[] = [];
  productList: any;
  selectedGender: string = 'Male';

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private productService: AdminProductService,
    private toast: ToastrService, private router: Router,
    private route: ActivatedRoute,
    private wishlistService: WishlistService
  ) {

  }
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({ disable: 'mobile', duration: 1200, });
      AOS.refresh();
      this.getWishlistdetails();
      // this.getProduct();
      // this.changeSlide();
    }
  }

  totalList: any;
  getProduct() {
    this.productService.getProductlist().subscribe(
      (res: any) => {
        const allProducts = res.result;

        // Fetch wishlist after getting products
        this.wishlistService.getWishList().subscribe(
          (wishlistRes: any) => {
            const allWishlist = wishlistRes?.result || [];

            // Get product IDs from the wishlist
            const wishlistProductIds = allWishlist.map(
              (item: any) => item.productId._id
            );

            // Filter the productList to show only wishlist products
            this.productList = allProducts.filter((product: any) =>
              wishlistProductIds.includes(product._id)
            );
            console.log('Filtered Products (from Wishlist):', this.productList);
            this.totalList = this.productList.length || 0 ;
          },
          (error: any) => {
            console.error('Error fetching wishlist:', error);
            this.toast.warning(error.error.message);
          }
        );
      },
      (error: any) => {
        console.error('Error fetching product list:', error);
        this.toast.warning(error.error.message);
      }
    );
  }

  wishListData: any;
  getWishlistdetails() {
    let storedUser: any = localStorage.getItem('role');
    let user = JSON.parse(storedUser);
    let userId = user.id || '';
    this.wishlistService.getWishList().subscribe((res: any) => {
      const allWishlist = res?.result || [];
      console.log('allWishlist: ', allWishlist);
      this.wishListData = allWishlist.map((item: any) => item.productId);
      this.totalList = this.wishListData.length || 0 ;
    });
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
    this.router.navigate(['user/product-details', product._id], { state: { product, allProducts: this.filteredProducts } });
  }

  goBack() {
    this.router.navigate(['user/home']);
  }

}
