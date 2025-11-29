import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviornment } from '../../../../../environment/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export interface WishlistUpdateCallback {
  onSuccess?: (wishListData: any[]) => void;
  onError?: (error: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  public WishlistLength = new BehaviorSubject<number>(0);
  updateWishlistLength$: Observable<number> = this.WishlistLength.asObservable();
  private wishListData: any[] = [];

  constructor(private http: HttpClient) { }

  // ========== API Methods ==========
  getWishList(userId?: string): Observable<any[]> {
    const url = userId 
      ? `${enviornment.url}wishList/get?userId=${userId}`
      : `${enviornment.url}wishList/get`;
    return this.http.get<any[]>(url);
  }

  postWishlist(data: any): Observable<any> {
    return this.http.post(enviornment.url + "wishList/post", data);
  }

  updateWishList(id: any, categoryData: any): Observable<any> {
    return this.http.put(`${enviornment.url}wishList/update/${id}`, categoryData);
  }

  deleteWishList(id: { ids: string[] | number[] }): Observable<any> {
    return this.http.post(`${enviornment.url}wishList/delete`, id);
  }

  deleteWishLists(id: string): Observable<any> {
    return this.http.post(`${enviornment.url}wishList/delete`, { ids: [id] });
  }

  getLengthOfWishlist(length: number) {
    this.WishlistLength.next(length)
  }

  // ========== Common Business Logic Methods ==========

  /**
   * Check if user is logged in
   */
  isUserLoggedIn(): boolean {
    const userData = localStorage.getItem('role');
    if (userData) {
      const user = JSON.parse(userData);
      return !!(user && (user._id || user.id));
    }
    return false;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    const userData = localStorage.getItem('role');
    if (userData) {
      const user = JSON.parse(userData);
      return user._id || user.id || null;
    }
    return null;
  }

  /**
   * Get wishlist details and update products with isWishlisted status
   * This is the main method that components should use
   */
  getWishlistDetailsAndUpdateProducts(
    products: any[] | any,
    callback?: WishlistUpdateCallback
  ): void {
    const storedUser = localStorage.getItem('role');
    
    if (!storedUser) {
      // Guest user: Check localStorage
      this.handleGuestWishlist(products, callback);
      return;
    }

    const user = JSON.parse(storedUser);
    const userId = user?.id || user?._id || '';

    if (!userId) {
      this.wishListData = [];
      this.getLengthOfWishlist(0);
      this.updateProductsWishlistStatus(products, []);
      if (callback?.onError) {
        callback.onError('No user ID found');
      }
      return;
    }

    // Logged-in user: Get from API
    this.getWishList(userId).subscribe({
      next: (res: any) => {
        if (res?.code === 200 && res?.success === true) {
          this.wishListData = res?.result || [];
          this.getLengthOfWishlist(this.wishListData.length);

          const wishlistedProductIds = this.wishListData.map(
            (w: any) => w.productId?._id || w.productId
          );

          this.updateProductsWishlistStatus(products, wishlistedProductIds);
          
          if (callback?.onSuccess) {
            callback.onSuccess(this.wishListData);
          }
        } else {
          this.wishListData = [];
          this.getLengthOfWishlist(0);
          this.updateProductsWishlistStatus(products, []);
          if (callback?.onError) {
            callback.onError(res?.message || 'Failed to fetch wishlist');
          }
        }
      },
      error: (error: any) => {
        console.error('Error fetching wishlist:', error);
        this.wishListData = [];
        this.getLengthOfWishlist(0);
        this.updateProductsWishlistStatus(products, []);
        if (callback?.onError) {
          callback.onError(error);
        }
      }
    });
  }

  /**
   * Handle guest user wishlist from localStorage
   */
  private handleGuestWishlist(
    products: any[] | any,
    callback?: WishlistUpdateCallback
  ): void {
    const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
    const guestWishlistIds = guestWishlist.map((item: any) => item.productId || item._id);
    
    this.getLengthOfWishlist(guestWishlist.length);
    this.updateProductsWishlistStatus(products, guestWishlistIds);
    
    if (callback?.onSuccess) {
      callback.onSuccess(guestWishlist);
    }
  }

  /**
   * Update products with wishlist status
   */
  private updateProductsWishlistStatus(
    products: any[] | any,
    wishlistedProductIds: string[]
  ): void {
    if (Array.isArray(products)) {
      // Update array of products
      products.forEach((product: any) => {
        if (product && product._id) {
          product.isWishlisted = wishlistedProductIds.includes(product._id);
        }
      });
    } else if (products && products._id) {
      // Update single product
      products.isWishlisted = wishlistedProductIds.includes(products._id);
    }
  }

  /**
   * Toggle wishlist for a product (add/remove)
   * This is the main method components should use for toggling
   */
  toggleWishlist(
    product: any,
    event: Event,
    toastService: ToastrService,
    callback?: (updated: boolean) => void
  ): void {
    if (event) {
      event.stopPropagation();
    }

    if (!product || !product._id) {
      return;
    }

    if (this.isUserLoggedIn()) {
      this.toggleWishlistForLoggedInUser(product, toastService, callback);
    } else {
      this.toggleWishlistForGuest(product, toastService, callback);
    }
  }

  /**
   * Toggle wishlist for logged-in user
   */
  private toggleWishlistForLoggedInUser(
    product: any,
    toastService: ToastrService,
    callback?: (updated: boolean) => void
  ): void {
    const userId = this.getCurrentUserId();
    
    if (!userId) {
      toastService.warning('Please login to add items to wishlist');
      return;
    }

    if (!product.isWishlisted) {
      // Add to wishlist
      const payload = {
        userId: userId,
        productId: product._id
      };

      this.postWishlist(payload).subscribe({
        next: (res: any) => {
          if (res.code === 200 && res.success === true) {
            product.isWishlisted = true;
            toastService.success('Added to wishlist ❤️');
            // Refresh wishlist data
            this.getWishList(userId).subscribe((wishlistRes: any) => {
              if (wishlistRes?.code === 200 && wishlistRes?.success === true) {
                this.wishListData = wishlistRes?.result || [];
                this.getLengthOfWishlist(this.wishListData.length);
              }
            });
            if (callback) callback(true);
          } else {
            toastService.error(res.message || 'Failed to add to wishlist');
            if (callback) callback(false);
          }
        },
        error: (err: any) => {
          console.error(err);
          toastService.error(err.error?.message || 'Failed to add to wishlist');
          if (callback) callback(false);
        }
      });
    } else {
      // Remove from wishlist - fetch wishlist data if not available
      if (this.wishListData.length === 0) {
        this.getWishList(userId).subscribe((wishlistRes: any) => {
          if (wishlistRes?.code === 200 && wishlistRes?.success === true) {
            this.wishListData = wishlistRes?.result || [];
            this.performWishlistRemoval(product, userId, toastService, callback);
          }
        });
      } else {
        this.performWishlistRemoval(product, userId, toastService, callback);
      }
    }
  }

  /**
   * Perform wishlist removal
   */
  private performWishlistRemoval(
    product: any,
    userId: string,
    toastService: ToastrService,
    callback?: (updated: boolean) => void
  ): void {
    const matchedItem = this.wishListData.find(
      (w: any) => w.productId?._id === product._id || w.productId === product._id
    );

    if (matchedItem && matchedItem._id) {
      this.deleteWishLists(matchedItem._id).subscribe({
        next: (res: any) => {
          if (res.code === 200 && res.success === true) {
            product.isWishlisted = false;
            toastService.info('Removed from wishlist 💔');
            // Refresh wishlist data
            this.getWishList(userId).subscribe((wishlistRes: any) => {
              if (wishlistRes?.code === 200 && wishlistRes?.success === true) {
                this.wishListData = wishlistRes?.result || [];
                this.getLengthOfWishlist(this.wishListData.length);
              }
            });
            if (callback) callback(true);
          } else {
            toastService.error(res.message || 'Failed to remove from wishlist');
            if (callback) callback(false);
          }
        },
        error: (err: any) => {
          console.error(err);
          toastService.error(err.error?.message || 'Failed to remove from wishlist');
          if (callback) callback(false);
        }
      });
    } else {
      toastService.error('Wishlist item not found');
      if (callback) callback(false);
    }
  }

  /**
   * Toggle wishlist for guest user
   */
  private toggleWishlistForGuest(
    product: any,
    toastService: ToastrService,
    callback?: (updated: boolean) => void
  ): void {
    let guestWishlist: any[] = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
    
    const existingIndex = guestWishlist.findIndex(
      (item: any) => item.productId === product._id || item._id === product._id
    );

    if (existingIndex >= 0) {
      // Remove from wishlist
      guestWishlist.splice(existingIndex, 1);
      product.isWishlisted = false;
      toastService.info('Removed from wishlist 💔');
    } else {
      // Add to wishlist
      const wishlistItem = {
        productId: product._id,
        product: product // Store product data for display
      };
      guestWishlist.push(wishlistItem);
      product.isWishlisted = true;
      toastService.success('Added to wishlist ❤️');
    }

    localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
    this.getLengthOfWishlist(guestWishlist.length);
    
    if (callback) callback(true);
  }

  /**
   * Get current wishlist data (for components that need it)
   */
  getWishListData(): any[] {
    return this.wishListData;
  }

  /**
   * Set wishlist data (for components that fetch it separately)
   */
  setWishListData(data: any[]): void {
    this.wishListData = data;
  }
}
