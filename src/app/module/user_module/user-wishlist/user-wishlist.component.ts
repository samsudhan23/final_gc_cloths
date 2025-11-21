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
import { EncryptionService } from '../../../shared/service/encryption.service';
import { CartService } from '../../admin_module/service/cartService/cart.service';
import { apiResponse } from '../../../shared/interface/response';

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

  wishListItems: any[] = []; // Store full wishlist items with _id for deletion

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private productService: AdminProductService,
    private encryptionService: EncryptionService,
    private toast: ToastrService, private router: Router,
    private route: ActivatedRoute,
    private wishlistService: WishlistService,
    private cartService: CartService
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

  wishListData: any[] = [];

  // Check if user is logged in
  isUserLoggedIn(): boolean {
    const userData = localStorage.getItem('role');
    if (userData) {
      const user = JSON.parse(userData);
      return !!(user && (user._id || user.id));
    }
    return false;
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    const userData = localStorage.getItem('role');
    if (userData) {
      const user = JSON.parse(userData);
      return user._id || user.id || null;
    }
    return null;
  }

  getWishlistdetails() {
    if (this.isUserLoggedIn()) {
      // Logged-in user: Get from API with userId filter
      const userId = this.getCurrentUserId();
      if (!userId) {
        this.toast.warning('User not found. Please login again.');
        return;
      }

      this.wishlistService.getWishList(userId).subscribe((res: any) => {
        if (res?.code === 200 && res?.success === true) {
          const allWishlist = res?.result || [];
          console.log('allWishlist: ', allWishlist);
          
          // Store full wishlist items for deletion
          this.wishListItems = allWishlist;
          
          // Extract products for display
          this.wishListData = allWishlist
            .filter((item: any) => item.productId != null)
            .map((item: any) => ({
              ...item.productId,
              wishlistId: item._id // Store wishlist ID for deletion
            }));
          
          this.totalList = this.wishListData.length || 0;
          this.wishlistService.getLengthOfWishlist(this.totalList);
        } else {
          this.wishListData = [];
          this.totalList = 0;
          this.wishlistService.getLengthOfWishlist(0);
        }
      }, (error: any) => {
        console.error('Error fetching wishlist:', error);
        this.toast.error(error.error?.message || 'Failed to load wishlist');
        this.wishListData = [];
        this.totalList = 0;
      });
    } else {
      // Guest user: Get from localStorage
      const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
      console.log('guestWishlist: ', guestWishlist);
      
      if (guestWishlist.length === 0) {
        this.wishListData = [];
        this.totalList = 0;
        this.wishlistService.getLengthOfWishlist(0);
        return;
      }

      // Get product details for each wishlist item
      const productIds = guestWishlist.map((item: any) => item.productId || item._id);
      
      // Fetch all products to get full product details
      this.productService.getProductlist().subscribe((res: any) => {
        const allProducts = res?.result || [];
        
        // Map guest wishlist items to products
        this.wishListData = guestWishlist.map((item: any) => {
          const productId = item.productId || item._id;
          const product = allProducts.find((p: any) => p._id === productId);
          
          if (product) {
            return {
              ...product,
              isGuestWishlist: true // Flag to identify guest wishlist items
            };
          }
          
          // If product not found in API, use stored product data
          return item.product || item;
        }).filter((item: any) => item != null);
        
        this.totalList = this.wishListData.length || 0;
        this.wishlistService.getLengthOfWishlist(this.totalList);
      }, (error: any) => {
        console.error('Error fetching products:', error);
        // Fallback: use stored product data from localStorage
        this.wishListData = guestWishlist
          .map((item: any) => item.product || item)
          .filter((item: any) => item != null);
        this.totalList = this.wishListData.length || 0;
        this.wishlistService.getLengthOfWishlist(this.totalList);
      });
    }
  }

  addToCart(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (!this.isUserLoggedIn()) {
      this.toast.warning('Please login to add items to cart');
      return;
    }

    // Add to cart logic (you can implement based on your cart service)
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.toast.warning('User not found. Please login again.');
      return;
    }

    // Get first available size
    const firstSize = product.sizeStock && product.sizeStock.length > 0 
      ? product.sizeStock[0] 
      : null;

    if (!firstSize || firstSize.stock <= 0) {
      this.toast.warning('Product is out of stock');
      return;
    }

    const cartData = {
      userId: userId,
      productId: product._id,
      quantity: 1,
      selectedSize: firstSize.size,
    };

    this.cartService.postCart(cartData).subscribe(
      (res: apiResponse) => {
        if (res?.code === 200 && res?.success === true) {
          this.toast.success('Product added to cart');
        } else {
          this.toast.error(res?.message || 'Failed to add to cart');
        }
      },
      (error: any) => {
        this.toast.error(error.error?.message || 'Failed to add to cart');
      }
    );
  }

  addToWishlist(product: any) {
    console.log("Added to wishlist:", product);
    // your wishlist logic here
  }

  // Remove from wishlist
  removeFromWishlist(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    if (this.isUserLoggedIn()) {
      // Logged-in user: Remove via API
      const wishlistItem = this.wishListItems.find(
        (item: any) => item.productId?._id === product._id || item.productId === product._id
      );

      if (wishlistItem && wishlistItem._id) {
        this.wishlistService.deleteWishLists(wishlistItem._id).subscribe({
          next: (res: any) => {
            if (res.code === 200 && res.success === true) {
              this.toast.success('Removed from wishlist');
              this.getWishlistdetails(); // Refresh list
            } else {
              this.toast.error(res.message || 'Failed to remove from wishlist');
            }
          },
          error: (err: any) => {
            console.error(err);
            this.toast.error(err.error?.message || 'Failed to remove from wishlist');
          }
        });
      }
    } else {
      // Guest user: Remove from localStorage
      let guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
      
      guestWishlist = guestWishlist.filter(
        (item: any) => (item.productId || item._id) !== product._id
      );
      
      localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
      this.toast.success('Removed from wishlist');
      this.getWishlistdetails(); // Refresh list
    }
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

  trackByProduct(index: number, product: any): any {
    return product?._id || index;
  }

}
