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
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import * as AOS from 'aos';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { QuickViewComponent } from '../../../shared/components/quick-view/quick-view.component';
import { WishlistService } from '../../admin_module/service/wishlistService/wishlist.service';
import { CategoryService } from '../../admin_module/service/category/category.service';

@Component({
  selector: 'app-allproducts',
  imports: [CommonModule, BadgeModule, AvatarModule, InputTextModule, TabsModule, ButtonModule, RouterModule, QuickViewComponent, FormsModule, CheckboxModule, SliderModule],
  templateUrl: './allproducts.component.html',
  styleUrl: './allproducts.component.scss'
})
export class AllproductsComponent {


  selectedCategory: string = 'All';
  filteredProducts: any[] = [];
  allProducts: any[] = []; // Store all products for filtering
  categoryList: any[] = [];
  genderList: any[] = [];
  productList: any;
  selectedGender: string = 'Men';
  wishListData: any[] = [];

  // Filter properties
  selectedCategories: string[] = [];
  selectedGenders: string[] = [];
  selectedSizes: string[] = [];
  priceRange: number[] = [0, 100000];
  minPrice: number = 0;
  maxPrice: number = 100000;
  availableSizes: string[] = [];
  isFilterOpen: boolean = true; // Mobile filter toggle
  searchQuery: string = ''; // Search query from URL

  constructor(@Inject(PLATFORM_ID) private platformId: Object, 
    private productService: AdminProductService,
    private categoryService: CategoryService,
    private encryptionService: EncryptionService,
    private toast: ToastrService, 
    private router: Router,
    private route: ActivatedRoute,
    private wishlistService: WishlistService,
  ) {

  }
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({ disable: 'mobile', duration: 1200, });
      AOS.refresh();
      this.filteredProducts = [];
      this.route.paramMap.subscribe(params => {
        this.selectedGender = params.get('categoryName') || '';
        this.getProduct();
      });
      // Get search query from route
      this.route.queryParams.subscribe(params => {
        if (params['search']) {
          this.searchQuery = params['search'];
        }
        this.getProduct();
      });
      this.getCategoryList();
      this.getGenderList();
    }
  }

  getCategoryList() {
    this.categoryService.getCategoriesMasterList().subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.categoryList = res.result || [];
      }
    });
  }

  getGenderList() {
    this.categoryService.getGenderList().subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.genderList = res.result || [];
      }
    });
  }


  getProduct() {
    this.productService.getProductlist().subscribe((res: any) => {
      const allProducts = res.result;
      this.allProducts = allProducts; // Store all products
      
      // Initial filter based on route parameter
      if (this.selectedGender && this.selectedGender.trim() !== '') {
        this.filteredProducts = allProducts.filter(
          (item: any) =>
            item.category?.categoryName?.toLowerCase() ===
            this.selectedGender.toLowerCase()
        );
      } else {
        this.filteredProducts = allProducts;
      }

      // Extract available sizes and price range
      this.extractFilterOptions();
      this.applyFilters();
      this.getWishlistdetails();
    }, (error: any) => {
      this.toast.warning(error.error.message);
    })
  }

  extractFilterOptions() {
    // Extract unique sizes from all products
    const sizesSet = new Set<string>();
    this.allProducts.forEach((product: any) => {
      if (product.sizeStock && Array.isArray(product.sizeStock)) {
        product.sizeStock.forEach((size: any) => {
          if (size.size) {
            sizesSet.add(size.size);
          }
        });
      }
    });
    this.availableSizes = Array.from(sizesSet).sort();

    // Extract price range
    const prices = this.allProducts.map((p: any) => p.discountPrice || p.price).filter((p: any) => p != null);
    if (prices.length > 0) {
      this.minPrice = Math.min(...prices);
      this.maxPrice = Math.max(...prices);
      this.priceRange = [this.minPrice, this.maxPrice];
    }
  }

  applyFilters() {
    let filtered = [...this.allProducts];

    // Search query filter (from URL or search bar)
    if (this.searchQuery && this.searchQuery.trim().length >= 2) {
      const searchTerm = this.searchQuery.toLowerCase();
      filtered = filtered.filter((product: any) => {
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
      });
    }

    // Category filter
    if (this.selectedCategories.length > 0) {
      filtered = filtered.filter((product: any) =>
        this.selectedCategories.includes(product.category?.categoryName)
      );
    }

    // Gender filter
    if (this.selectedGenders.length > 0) {
      filtered = filtered.filter((product: any) =>
        this.selectedGenders.includes(product.gender?.genderName)
      );
    }

    // Size filter
    if (this.selectedSizes.length > 0) {
      filtered = filtered.filter((product: any) => {
        if (!product.sizeStock || !Array.isArray(product.sizeStock)) return false;
        return product.sizeStock.some((size: any) => 
          this.selectedSizes.includes(size.size) && size.stock > 0
        );
      });
    }

    // Price filter
    filtered = filtered.filter((product: any) => {
      const price = product.discountPrice || product.price;
      return price >= this.priceRange[0] && price <= this.priceRange[1];
    });

    // Route parameter filter (if exists)
    if (this.selectedGender && this.selectedGender.trim() !== '') {
      filtered = filtered.filter(
        (item: any) =>
          item.category?.categoryName?.toLowerCase() ===
          this.selectedGender.toLowerCase()
      );
    }

    this.filteredProducts = filtered;
    this.getWishlistdetails();
  }

  onCategoryChange(categoryName: string, event: any) {
    if (event.target.checked) {
      this.selectedCategories.push(categoryName);
    } else {
      this.selectedCategories = this.selectedCategories.filter(c => c !== categoryName);
    }
    this.applyFilters();
  }

  onGenderChange(genderName: string, event: any) {
    if (event.target.checked) {
      this.selectedGenders.push(genderName);
    } else {
      this.selectedGenders = this.selectedGenders.filter(g => g !== genderName);
    }
    this.applyFilters();
  }

  onSizeChange(size: string, event: any) {
    if (event.target.checked) {
      this.selectedSizes.push(size);
    } else {
      this.selectedSizes = this.selectedSizes.filter(s => s !== size);
    }
    this.applyFilters();
  }

  onPriceChange() {
    this.applyFilters();
  }

  clearAllFilters() {
    this.selectedCategories = [];
    this.selectedGenders = [];
    this.selectedSizes = [];
    this.priceRange = [this.minPrice, this.maxPrice];
    this.searchQuery = '';
    // Clear search from URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: null },
      queryParamsHandling: 'merge'
    });
    this.applyFilters();
  }

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  getCategoryCount(categoryName: string): number {
    return this.allProducts.filter((p: any) => p.category?.categoryName === categoryName).length;
  }

  getGenderCount(genderName: string): number {
    return this.allProducts.filter((p: any) => p.gender?.genderName === genderName).length;
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
    this.router.navigate(['user/productlists']);
  }

}
