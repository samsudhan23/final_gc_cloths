import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdminProductService } from '../../admin_module/service/productService/admin-product.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import * as AOS from 'aos';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { QuickViewComponent } from '../../../shared/components/quick-view/quick-view.component';
import { WishlistService } from '../../admin_module/service/wishlistService/wishlist.service';
import { CategoryService } from '../../admin_module/service/category/category.service';
import { ProductCardSkeletonComponent } from '../../../shared/components/skeletons/product-card-skeleton/product-card-skeleton.component';
import { FilterSkeletonComponent } from '../../../shared/components/skeletons/filter-skeleton/filter-skeleton.component';

@Component({
  selector: 'app-categorywiseproduct',
  imports: [CommonModule, BadgeModule, AvatarModule, InputTextModule, TabsModule, ButtonModule, RouterModule, QuickViewComponent, FormsModule, CheckboxModule, SliderModule, ProductCardSkeletonComponent, FilterSkeletonComponent],
  templateUrl: './categorywiseproduct.component.html',
  styleUrl: './categorywiseproduct.component.scss'
})
export class CategorywiseproductComponent {

  selectedCategory: any;
  filteredProducts: any[] = [];
  allProducts: any[] = []; // Store all products
  baseFilteredProducts: any[] = []; // Store products filtered by route params (gender/category)
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
  isLoading: boolean = false;
  isLoadingCategories: boolean = false;
  isLoadingGenders: boolean = false;

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
    this.getCategoryList();
    this.getGenderList();
  }
  }
  
  getCategoryList() {
    this.isLoadingCategories = true;
    this.categoryService.getCategoriesMasterList().subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.categoryList = res.result || [];
      }
      this.isLoadingCategories = false;
    }, (error: any) => {
      this.isLoadingCategories = false;
    });
  }

  getGenderList() {
    this.isLoadingGenders = true;
    this.categoryService.getGenderList().subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.genderList = res.result || [];
      }
      this.isLoadingGenders = false;
    }, (error: any) => {
      this.isLoadingGenders = false;
    });
  }


  getProduct() {
    this.isLoading = true;
    this.productService.getProductlist().subscribe((res: any) => {
      const allProducts = res.result;
      this.allProducts = allProducts; // Store all products

      // Initial filter based on route parameters
      let initialFiltered = allProducts;
      
      if (this.selectedGender && this.selectedGender.trim() !== '') {
        initialFiltered = allProducts.filter(
          (item: any) =>
            item.gender?.genderName?.toLowerCase() ===
            this.selectedGender.toLowerCase()
        );
      } else if (this.selectedCategory && this.selectedCategory.trim() !== '') {
        initialFiltered = allProducts.filter(
          (item: any) =>
            item.category?.categoryName?.toLowerCase() ===
            this.selectedCategory.toLowerCase()
        );
      }

      // Store base filtered products (from route params)
      this.baseFilteredProducts = [...initialFiltered];

      // Extract available sizes and price range from base filtered products
      this.extractFilterOptions();
      
      // Apply additional filters
      this.applyFilters();
      this.getWishlistdetails();
      this.isLoading = false;
    }, (error: any) => {
      this.toast.warning(error.error.message);
      this.isLoading = false;
    })
  }

  extractFilterOptions() {
    // Extract unique sizes from base filtered products (based on route params)
    const sizesSet = new Set<string>();
    this.baseFilteredProducts.forEach((product: any) => {
      if (product.sizeStock && Array.isArray(product.sizeStock)) {
        product.sizeStock.forEach((size: any) => {
          if (size.size) {
            sizesSet.add(size.size);
          }
        });
      }
    });
    this.availableSizes = Array.from(sizesSet).sort();

    // Extract price range from base filtered products
    const prices = this.baseFilteredProducts.map((p: any) => p.discountPrice || p.price).filter((p: any) => p != null);
    if (prices.length > 0) {
      this.minPrice = Math.min(...prices);
      this.maxPrice = Math.max(...prices);
      // Only set priceRange if it's at default values
      if (this.priceRange[0] === 0 && this.priceRange[1] === 100000) {
        this.priceRange = [this.minPrice, this.maxPrice];
      }
    } else {
      // Fallback if no products
      this.minPrice = 0;
      this.maxPrice = 100000;
      this.priceRange = [0, 100000];
    }
  }

  applyFilters() {
    // Always start with base filtered products (from route params)
    let filtered = [...this.baseFilteredProducts];

    // Category filter (additional to route params)
    if (this.selectedCategories.length > 0) {
      filtered = filtered.filter((product: any) =>
        this.selectedCategories.includes(product.category?.categoryName)
      );
    }

    // Gender filter (additional to route params)
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
    // Reset price range to min/max from base filtered products
    const prices = this.baseFilteredProducts.map((p: any) => p.discountPrice || p.price).filter((p: any) => p != null);
    if (prices.length > 0) {
      this.minPrice = Math.min(...prices);
      this.maxPrice = Math.max(...prices);
      this.priceRange = [this.minPrice, this.maxPrice];
    } else {
      this.priceRange = [0, 100000];
    }
    this.applyFilters();
  }

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  getCategoryCount(categoryName: string): number {
    return this.baseFilteredProducts.filter((p: any) => p.category?.categoryName === categoryName).length;
  }

  getGenderCount(genderName: string): number {
    return this.baseFilteredProducts.filter((p: any) => p.gender?.genderName === genderName).length;
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
