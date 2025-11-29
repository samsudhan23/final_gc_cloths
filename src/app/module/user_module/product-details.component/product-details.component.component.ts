import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../admin_module/service/cartService/cart.service';
import { FormsModule } from '@angular/forms';
import { apiResponse } from '../../../shared/interface/response';
import { AdminProductService } from '../../admin_module/service/productService/admin-product.service';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { WishlistService } from '../../admin_module/service/wishlistService/wishlist.service';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

@Component({
  selector: 'app-product-details.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.component.component.html',
  styleUrl: './product-details.component.component.scss',
  animations: [
    // Slide open/close animation
    trigger('expandCollapse', [
      state(
        'open',
        style({
          height: '*',
          opacity: 1,
          padding: '*',
          overflow: 'hidden'
        })
      ),
      state(
        'closed',
        style({
          height: '0px',
          opacity: 0,
          padding: '0 20px',
          overflow: 'hidden'
        })
      ),
      transition('open <=> closed', [animate('300ms ease-in-out')])
    ]),

    // Chevron rotation animation
    trigger('rotateChevron', [
      state(
        'up',
        style({
          transform: 'rotate(180deg)'
        })
      ),
      state(
        'down',
        style({
          transform: 'rotate(0deg)'
        })
      ),
      transition('up <=> down', [animate('300ms ease-in-out')])
    ]),

    trigger('slideToggle', [
      state('closed', style({ height: '0', opacity: 0 })),
      state('open', style({ height: '*', opacity: 1 })),
      transition('closed <=> open', animate('300ms ease-in-out')),
    ])
  ]
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  selectedImage: string | undefined = '';
  selectedSize: string | null = null;
  stock!: number
  relatedProducts: any[] = [];
  quantityValue: any = 1;
  cartLength!: number;
  productList: any[] = [];
  productID: number = 0;
  productSections: any[] = [];
  selectedId: any;
  isGotoCart: boolean = false;;

  wishListData: any[] = [];
  filteredProducts: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastrService,
    private cartService: CartService,
    private productService: AdminProductService,
    private encryptionService: EncryptionService,
    private wishlistService: WishlistService
  ) {
  }

  ngOnInit() {
    this.isGotoCart = false;
    this.getProduct();
    this.getWishlistdetails();
  }
  getProduct() {
    this.productService.getProductlist().subscribe((res: any) => {
      this.productList = res.result;
      console.log('allProducts: ', this.productList);
      // Filter based on selectedGender
      const encryptedProductId: any = this.route.snapshot.paramMap.get('productId');
      let productId = this.encryptionService.decrypt(encryptedProductId);
      this.filteredProducts = this.productList.filter((item: any) => item._id == productId)[0];      
      // Set related products based on same category
      if (this.filteredProducts) {
        this.relatedProducts = this.productList.filter(
          (p: any) => p.category?.categoryName === this.filteredProducts?.category?.categoryName && p._id !== this.filteredProducts?._id
        );
      }
      
      // Get wishlist details after product and related products are loaded
      this.getWishlistdetails();
    }, (error: any) => {
      this.toast.warning(error.error.message);
    })
  }
  // getProduct() {
  //   // Get encrypted product ID from route parameter
  //   const encryptedProductId = this.route.snapshot.paramMap.get('productId');

  //   if (!encryptedProductId) {
  //     this.toast.error('Product ID not found in URL');
  //     this.router.navigate(['user/home']);
  //     return;
  //   }

  //   // Decrypt the product ID
  //   let productId: string;
  //   try {
  //     productId = this.encryptionService.decrypt(encryptedProductId);
  //   } catch (error) {
  //     console.error('Error decrypting product ID:', error);
  //     this.toast.error('Invalid product link');
  //     this.router.navigate(['user/home']);
  //     return;
  //   }

  //   // Fetch product by ID using the API
  //   this.productService.geyProductsById(productId).subscribe({
  //     next: (res: apiResponse) => {
  //       if (res?.code === 200 && res?.success === true) {
  //         this.product = res.result;
  //         console.log('this.product: ', this.product);
  //         if (this.product) {
  //           this.buildProductSections(this.product);
  //           // Check wishlist status for this product
  //           this.checkProductWishlistStatus(this.product);
  //           // Fetch all products for related products
  //           this.productService.getProductlist().subscribe((productListRes: any) => {
  //             this.productList = productListRes.result || [];
  //             console.log(' this.productList: ', this.productList);
  //             this.relatedProducts = this.productList.filter(
  //               (p: any) => p.category?.categoryName === this.product?.category?.categoryName && p._id !== this.product?._id
  //             );
  //             // Check wishlist status for related products
  //             this.relatedProducts.forEach(product => {
  //               this.checkProductWishlistStatus(product);
  //             });
  //           });
  //         } else {
  //           this.toast.error('Product not found');
  //           this.router.navigate(['user/home']);
  //         }
  //       } else {
  //         this.toast.error(res?.message || 'Failed to load product');
  //         this.router.navigate(['user/home']);
  //       }
  //     },
  //     error: (error: any) => {
  //       console.error('Error fetching product:', error);
  //       this.toast.error(error.error?.message || 'Failed to load product details');
  //       this.router.navigate(['user/home']);
  //     }
  //   });
  // }
  changeImage(img: any) {
    this.selectedImage = img;
  }

  selectSize(size: any) {
    if (size?.stock > 0) {
      this.stock = size?.stock
      this.selectedSize = size?.size;
      if (this.quantityValue > size?.stock) { //selected size should below the available stock
        this.quantityValue = size?.stock
      }
    }
  }

  addToCart(product: any) {
    if (!this.selectedSize) {
      this.toast.warning('Please select a size first!');
      return;
    }

    const roleString = localStorage.getItem('role');
    const parse = roleString ? JSON.parse(roleString) : null;
    const prodDetails = product?.sizeStock.filter(
      (item: any) => item?.size == this.selectedSize
    );

    const cartItem = {
      _id: product?._id,
      quantity: this.quantityValue,
      selectedSize: prodDetails[0]?.size,
      productId: product, // keep entire product for localStorage display
    };

    // ✅ Case 1: Logged-in user → Save to backend
    if (parse && parse?.id) {
      const cartData = {
        userId: parse.id,
        productId: product._id,
        quantity: this.quantityValue,
        selectedSize: prodDetails[0]?.size,
      };

      this.cartService.postCart(cartData).subscribe(
        (res: apiResponse) => {
          if (res?.code === 200 && res?.success === true) {
            this.toast.success(res?.message);
            this.getCartLength();
            this.isGotoCart = true;
          } else {
            this.toast.error(res?.message);
          }
        },
        (error) => {
          this.toast.error(error.error.message);
        }
      );
    } else {
      // ✅ Case 2: Guest user → Save to localStorage
      const existingCart = JSON.parse(localStorage.getItem('guestCart') || '[]');

      // check if same product + size exists already
      const existingItemIndex = existingCart.findIndex(
        (item: any) =>
          item._id === cartItem._id &&
          item.selectedSize === cartItem.selectedSize
      );

      if (existingItemIndex >= 0) {
        existingCart[existingItemIndex].quantity += this.quantityValue;
        this.toast.info('Updated item quantity in cart!');
      } else {
        existingCart.push(cartItem);
        this.toast.success('Product added to cart!');
      }

      localStorage.setItem('guestCart', JSON.stringify(existingCart));
      this.getCartLength();
    }
  }

  // Cart Length
  getCartLength() {
    const roleString = localStorage.getItem('role');
    const parse = roleString ? JSON.parse(roleString) : null;
    const userId = parse?.id || parse?._id;

    if (userId) {
      // Logged-in user: Get from API with userId filter
      this.cartService.getCartList(userId).subscribe((res: apiResponse) => {
        if (res?.code === 200 && res?.success === true) {
          this.cartLength = (res.result || []).map((item: any) => item?.quantity || 0).reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0)
          this.cartService.getLengthOfCart(this.cartLength) //using service to pass lenght of cart
        }
      })
    }
    else {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      this.cartLength = guestCart;
      this.cartLength = guestCart.map((item: any) => item?.quantity).reduce((accumulator: any, currentValue: any) => accumulator + currentValue, 0)
      this.cartService.getLengthOfCart(this.cartLength)
    }
  }
  quantityAdding(event: String) {
    if (event === 'add') {
      this.quantityValue++;
    } else {
      this.quantityValue--;
    }
  }
  buyNow(product: any) {
    if (!this.selectedSize) {
      this.toast.warning('Please select a size first!');
      return;
    }
  }

  getWishlistdetails() {
    // Combine main product and related products for wishlist status update
    const allProducts = [];
    if (this.filteredProducts) {
      allProducts.push(this.filteredProducts);
    }
    if (this.relatedProducts && this.relatedProducts.length > 0) {
      allProducts.push(...this.relatedProducts);
    }

    // Use centralized service method
    this.wishlistService.getWishlistDetailsAndUpdateProducts(allProducts, {
      onSuccess: (wishListData: any[]) => {
        this.wishListData = wishListData;
      },
      onError: (error: any) => {
        console.error('Error fetching wishlist:', error);
        this.wishListData = [];
      }
    });
  }

  // Toggle wishlist - uses centralized service method
  toggleWishlist(product: any, event: Event) {
    this.wishlistService.toggleWishlist(product, event, this.toast, (updated: boolean) => {
      if (updated) {
        // Refresh wishlist details after toggle
        this.getWishlistdetails();
      }
    });
  }

  goToDetails(product: any) {
    // Keep a reference of the current main product
    const previousProduct = this.filteredProducts;

    // Set the clicked product as the new main product
    this.filteredProducts = product;
    this.selectedImage = product.images;

    // Rebuild related products list:
    // 1. Remove the clicked product from related list
    // 2. Add the previous product into related list
    // 3. Ensure only products of the same category remain
    this.relatedProducts = this.relatedProducts
      .filter((p) => p._id !== product._id); // remove selected one
    console.log('this.relatedProducts: ', this.relatedProducts);

    if (previousProduct) {
      this.relatedProducts.push(previousProduct); // put old main into related
    }

    // keep only same-category items
    this.relatedProducts = this.relatedProducts.filter(
      (p) => p.category.categoryName === this.filteredProducts?.category?.categoryName && p._id !== this.filteredProducts?._id
    );

    // Rebuild the product sections dynamically
    this.buildProductSections(this.filteredProducts);
    
    // Check wishlist status for the new product and related products
    this.getWishlistdetails();
  }

  // central method to rebuild all accordion sections dynamically
  buildProductSections(product: any) {
    if (!product) return;

    this.productSections = [];

    // Product Details
    this.productSections.push({
      title: 'Product Details',
      content: `
        <ul class="list-disc ml-5">
          <li><b>Category:</b> ${product?.category?.categoryName || 'N/A'}</li>
          <li><b>Gender:</b> ${product?.gender?.genderName || 'Unisex'}</li>
          <li><b>Price:</b> ₹${product?.price || 'N/A'}</li>
          <li><b>Discount Price:</b> ₹${product?.discountPrice || 'N/A'}</li>
          <li><b>SKU:</b> ${product?.sku || 'N/A'}</li>
          <li><b>Total Stock:</b> ${product?.totalStock || 0}</li>
        </ul>
      `,
      open: true
    });

    // Description
    if (product?.productDescription && product.productDescription !== 'null') {
      this.productSections.push({
        title: 'Product Description',
        content: `<p>${product.productDescription}</p>`,
        open: false
      });
    }

    // Care Instructions
    if (product?.careInstruction && product.careInstruction !== 'null') {
      this.productSections.push({
        title: 'Care Instructions',
        content: `<p>${product.careInstruction}</p>`,
        open: false
      });
    }

    // Sizes
    if (product?.sizeStock?.length > 0) {
      const sizeList = product.sizeStock
        .map((s: any) => `<li>${s.size} - ${s.stock} in stock</li>`)
        .join('');
      this.productSections.push({
        title: 'Available Sizes',
        content: `<ul class="list-disc ml-5">${sizeList}</ul>`,
        open: false
      });
    }

    // Tags
    if (product?.tags?.length > 0) {
      this.productSections.push({
        title: 'Tags',
        content: `<p>${product.tags.join(', ')}</p>`,
        open: false
      });
    }

    // About
    this.productSections.push({
      title: 'About the Product',
      content: `<p>This ${product.category?.categoryName?.toLowerCase() || 'product'
        } is crafted with care to offer durability, comfort, and a trendy look.</p>`,
      open: false
    });
  }

  toggleSection(selectedSection: any) {
    this.productSections.forEach((section) => {
      section.open = section === selectedSection ? !section.open : false;
    });
  }

  currentUrl = '';
  linkCopied = false;
  pincode = '';
  pincodeChecked = false;
  estimatedDelivery = '';

  copyLink() {
    navigator.clipboard.writeText(this.currentUrl).then(() => {
      this.linkCopied = true;
      setTimeout(() => (this.linkCopied = false), 2000);
    });
  }

  checkPincode() {
    if (this.pincodeChecked) {
      // User clicked "Change"
      this.pincodeChecked = false;
      this.pincode = '';
      this.estimatedDelivery = '';
      return;
    }

    // When clicking "Check" first — ensure size selected
    if (!this.selectedSize) {
      alert('Please select a size before checking delivery.');
      return;
    }

    // Validate pincode
    if (this.pincode.trim().length === 6) {
      this.pincodeChecked = true;

      // Mock estimated delivery (3–6 days)
      const today = new Date();
      const estimated = new Date(today.setDate(today.getDate() + 6));
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
      this.estimatedDelivery = estimated.toLocaleDateString('en-GB', options);
    } else {
      alert('Please enter a valid 6-digit pincode.');
    }
    // if (this.pincode.trim().length === 6) {
    //   this.pincodeChecked = true;

    //   // Mock estimated delivery (3–6 days)
    //   const today = new Date();
    //   const estimated = new Date(today.setDate(today.getDate() + 6));
    //   const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    //   this.estimatedDelivery = estimated.toLocaleDateString('en-GB', options);
    // } else {
    //   alert('Please enter a valid 6-digit pincode');
    // }
  }

  goBack() {
    this.router.navigate(['user/home']);
  }

  goToCart() {
    this.router.navigate(['user/cart']);
  }
}
