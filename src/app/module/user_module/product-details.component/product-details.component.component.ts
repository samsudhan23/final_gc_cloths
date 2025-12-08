import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
export class ProductDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sliderContainer', { static: false }) sliderContainer!: ElementRef;
  
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

  // Slider properties
  private slider: HTMLElement | null = null;
  private sliders: HTMLCollection | null = null;
  private initX: number | null = null;
  private transX: number = 0;
  private rotZ: number = 0;
  private transY: number = 0;
  private curSlide: HTMLElement | null = null;
  private prevSlide: HTMLElement | null = null;
  private readonly Z_DIS: number = 50;
  private readonly Y_DIS: number = 10;
  private readonly TRANS_DUR: number = 0.4;
  private slideMouseMoveHandler: ((e: MouseEvent | TouchEvent) => void) | null = null;
  private slideMouseUpHandler: (() => void) | null = null;
  private slideMouseDownHandler: ((e: MouseEvent | TouchEvent) => void) | null = null;
  private slideTouchStartHandler: ((e: MouseEvent | TouchEvent) => void) | null = null;

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

  ngAfterViewInit() {
    // Initialize slider after view is ready
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      if (this.filteredProducts && this.sliderContainer) {
        this.initSlider();
      }
    }, 300);
  }

  ngOnDestroy() {
    this.cleanupSlider();
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
      
      // Initialize slider after products are loaded
      setTimeout(() => {
        this.initSlider();
      }, 200);
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
    
    // Reinitialize slider with new product images
    setTimeout(() => {
      this.cleanupSlider();
      this.initSlider();
    }, 200);
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

  // Elastic Slider Methods
  initSlider(): void {
    if (!this.sliderContainer || !this.filteredProducts) {
      return;
    }

    this.slider = this.sliderContainer.nativeElement.querySelector('.slider') as HTMLElement;
    if (!this.slider) {
      return;
    }

    this.sliders = this.slider.children;
    
    if (!this.sliders || this.sliders.length === 0) {
      return;
    }
    
    // Prevent image drag
    const images = this.slider.querySelectorAll('img');
    images.forEach((img: HTMLImageElement) => {
      img.addEventListener('mousemove', (e: MouseEvent) => {
        e.preventDefault();
      });
      img.addEventListener('dragstart', (e: DragEvent) => {
        e.preventDefault();
        return false;
      });
    });

    this.init();
  }

  private init(): void {
    if (!this.sliders || this.sliders.length === 0) {
      return;
    }

    let z = 0;
    let y = 0;

    // Initialize slides from last to first
    for (let i = this.sliders.length - 1; i >= 0; i--) {
      const slide = this.sliders[i] as HTMLElement;
      slide.style.transform = `translateZ(${z}px) translateY(${y}px)`;
      z -= this.Z_DIS;
      y += this.Y_DIS;
    }

    // Attach events to the last slide (topmost)
    this.attachEvents(this.sliders[this.sliders.length - 1] as HTMLElement);
  }

  private attachEvents(elem: HTMLElement): void {
    // Remove old event listeners if curSlide exists
    if (this.curSlide && this.slideMouseDownHandler) {
      this.curSlide.removeEventListener('mousedown', this.slideMouseDownHandler, false);
    }
    if (this.curSlide && this.slideTouchStartHandler) {
      this.curSlide.removeEventListener('touchstart', this.slideTouchStartHandler, false);
    }

    this.curSlide = elem;

    // Store bound handlers so we can remove them later
    this.slideMouseDownHandler = this.slideMouseDown.bind(this);
    this.slideTouchStartHandler = this.slideMouseDown.bind(this);
    
    this.curSlide.addEventListener('mousedown', this.slideMouseDownHandler, false);
    this.curSlide.addEventListener('touchstart', this.slideTouchStartHandler, false);
  }

  private slideMouseDown(e: MouseEvent | TouchEvent): void {
    if (e instanceof TouchEvent && e.touches) {
      this.initX = e.touches[0].clientX;
    } else if (e instanceof MouseEvent) {
      this.initX = e.pageX;
    }

    this.slideMouseMoveHandler = this.slideMouseMove.bind(this);
    this.slideMouseUpHandler = this.slideMouseUp.bind(this);

    document.addEventListener('mousemove', this.slideMouseMoveHandler, false);
    document.addEventListener('touchmove', this.slideMouseMoveHandler, false);
    document.addEventListener('mouseup', this.slideMouseUpHandler, false);
    document.addEventListener('touchend', this.slideMouseUpHandler, false);
  }

  private slideMouseMove(e: MouseEvent | TouchEvent): void {
    if (!this.curSlide || this.initX === null || !this.sliders) {
      return;
    }

    let mouseX: number;
    if (e instanceof TouchEvent && e.touches) {
      mouseX = e.touches[0].clientX;
    } else if (e instanceof MouseEvent) {
      mouseX = e.pageX;
    } else {
      return;
    }

    this.transX += mouseX - this.initX;
    this.rotZ = this.transX / 20;
    this.transY = -Math.abs(this.transX / 15);

    this.curSlide.style.transition = 'none';
    this.curSlide.style.webkitTransform = `translateX(${this.transX}px) rotateZ(${this.rotZ}deg) translateY(${this.transY}px)`;
    this.curSlide.style.transform = `translateX(${this.transX}px) rotateZ(${this.rotZ}deg) translateY(${this.transY}px)`;

    let j = 1;
    // Update remaining elements
    for (let i = this.sliders.length - 2; i >= 0; i--) {
      const slide = this.sliders[i] as HTMLElement;
      slide.style.webkitTransform = `translateX(${this.transX / (2 * j)}px) rotateZ(${this.rotZ / (2 * j)}deg) translateY(${this.Y_DIS * j}px) translateZ(${-this.Z_DIS * j}px)`;
      slide.style.transform = `translateX(${this.transX / (2 * j)}px) rotateZ(${this.rotZ / (2 * j)}deg) translateY(${this.Y_DIS * j}px) translateZ(${-this.Z_DIS * j}px)`;
      slide.style.transition = 'none';
      j++;
    }

    this.initX = mouseX;
    e.preventDefault();

    if (Math.abs(this.transX) >= this.curSlide.offsetWidth - 30) {
      // Remove event listeners before transitioning
      if (this.slideMouseMoveHandler) {
        document.removeEventListener('mousemove', this.slideMouseMoveHandler, false);
        document.removeEventListener('touchmove', this.slideMouseMoveHandler, false);
      }
      if (this.slideMouseUpHandler) {
        document.removeEventListener('mouseup', this.slideMouseUpHandler, false);
        document.removeEventListener('touchend', this.slideMouseUpHandler, false);
      }
      
      // Reset dragging state
      this.initX = null;
      
      this.curSlide.style.transition = 'ease 0.2s';
      this.curSlide.style.opacity = '0';
      this.prevSlide = this.curSlide;
      
      if (this.sliders.length > 1) {
        this.attachEvents(this.sliders[this.sliders.length - 2] as HTMLElement);
      }
      
      // Reset transforms
      this.transX = 0;
      this.rotZ = 0;
      this.transY = 0;

      setTimeout(() => {
        if (this.slider && this.prevSlide) {
          this.slider.insertBefore(this.prevSlide, this.slider.firstChild);
          this.prevSlide.style.transition = 'none';
          this.prevSlide.style.opacity = '1';
          
          // Reinitialize slider after slide is moved
          this.init();
        }
      }, 201);

      return;
    }
  }

  private slideMouseUp(): void {
    // Remove all event listeners first
    if (this.slideMouseMoveHandler) {
      document.removeEventListener('mousemove', this.slideMouseMoveHandler, false);
      document.removeEventListener('touchmove', this.slideMouseMoveHandler, false);
    }
    if (this.slideMouseUpHandler) {
      document.removeEventListener('mouseup', this.slideMouseUpHandler, false);
      document.removeEventListener('touchend', this.slideMouseUpHandler, false);
    }

    // Reset dragging state
    this.initX = null;
    
    if (!this.curSlide || !this.sliders) {
      return;
    }

    this.transX = 0;
    this.rotZ = 0;
    this.transY = 0;

    this.curSlide.style.transition = `cubic-bezier(0,1.95,.49,.73) ${this.TRANS_DUR}s`;
    this.curSlide.style.webkitTransform = `translateX(${this.transX}px) rotateZ(${this.rotZ}deg) translateY(${this.transY}px)`;
    this.curSlide.style.transform = `translateX(${this.transX}px) rotateZ(${this.rotZ}deg) translateY(${this.transY}px)`;

    // Update remaining elements
    let j = 1;
    for (let i = this.sliders.length - 2; i >= 0; i--) {
      const slide = this.sliders[i] as HTMLElement;
      slide.style.transition = `cubic-bezier(0,1.95,.49,.73) ${this.TRANS_DUR / (j + 0.9)}s`;
      slide.style.webkitTransform = `translateX(${this.transX}px) rotateZ(${this.rotZ}deg) translateY(${this.Y_DIS * j}px) translateZ(${-this.Z_DIS * j}px)`;
      slide.style.transform = `translateX(${this.transX}px) rotateZ(${this.rotZ}deg) translateY(${this.Y_DIS * j}px) translateZ(${-this.Z_DIS * j}px)`;
      j++;
    }
  }

  private cleanupSlider(): void {
    // Remove document-level event listeners
    if (this.slideMouseMoveHandler) {
      document.removeEventListener('mousemove', this.slideMouseMoveHandler, false);
      document.removeEventListener('touchmove', this.slideMouseMoveHandler, false);
    }
    if (this.slideMouseUpHandler) {
      document.removeEventListener('mouseup', this.slideMouseUpHandler, false);
      document.removeEventListener('touchend', this.slideMouseUpHandler, false);
    }
    
    // Remove slide-level event listeners
    if (this.curSlide && this.slideMouseDownHandler) {
      this.curSlide.removeEventListener('mousedown', this.slideMouseDownHandler, false);
    }
    if (this.curSlide && this.slideTouchStartHandler) {
      this.curSlide.removeEventListener('touchstart', this.slideTouchStartHandler, false);
    }
    
    // Reset handlers
    this.slideMouseMoveHandler = null;
    this.slideMouseUpHandler = null;
    this.slideMouseDownHandler = null;
    this.slideTouchStartHandler = null;
    this.initX = null;
  }
}
