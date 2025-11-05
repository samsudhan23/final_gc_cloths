import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../admin_module/service/cartService/cart.service';
import { FormsModule } from '@angular/forms';
import { apiResponse } from '../../../shared/interface/response';
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
  product: any;
  selectedImage: string = '';
  selectedSize: string | null = null;
  stock!: number
  relatedProducts: any[] = [];
  quantityValue: any = 1;
  cartLength!: number;
  productSections: any[] = [];
  selectedId: any;
  constructor(
    private router: Router,
    private toast: ToastrService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.product = navigation?.extras?.state?.['product'];
    console.log('this.product: ', this.product);
    const allProducts = navigation?.extras?.state?.['allProducts'] || [];

    this.route.paramMap.subscribe(params => {
      this.selectedId = params.get('_id') || '';
      console.log('this.selectedId: ', this.selectedId);
    });

    if (this.product && allProducts.length) {
      this.relatedProducts = allProducts.filter(
        (p: any) => p.category?.categoryName === this.product?.category?.categoryName && p._id !== this.product?._id
      );
    }
  }

  ngOnInit() {
    if (this.product) {
      this.selectedImage = this.product?.images;
      console.log('this.selectedImage: ', this.selectedImage);
      this.buildProductSections(this.product);
    }
    this.currentUrl = window.location.href;
  }

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
    const parse = JSON.parse(localStorage.getItem('role') || '')
    const prodDetails = product?.sizeStock.filter((item: any) => item?.size == this.selectedSize)
    const cartData = {
      userId: parse?.id,
      productId: product?._id,
      quantity: this.quantityValue,
      selectedSize: prodDetails[0]?.size
    }
    this.cartService.postCart(cartData).subscribe((res: apiResponse) => {
      if (res?.code === 200 && res?.success === true) {
        this.toast.success(res?.message);
        this.getCartLength();
      }
      else {
        this.toast.error(res?.message);
      }
    }, (error) => {
      this.toast.error(error.error.message);
    })
  }
  // Cart Length
  getCartLength() {
    this.cartService.getCartList().subscribe((res: apiResponse) => {
      if (res?.code === 200 && res?.success === true) {
        this.cartLength = res.result.map(item => item?.quantity).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        this.cartService.getLengthOfCart(this.cartLength) //using service to pass lenght of cart
      }
    })
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

  toggleWishlist(product: any) {
    product.isWishlisted = !product.isWishlisted;
  }

  goToDetails(product: any) {
    // Keep a reference of the current main product
    const previousProduct = this.product;

    // Set the clicked product as the new main product
    this.product = product;
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
      (p) => p.category.categoryName === this.product.category.categoryName && p._id !== this.product._id
    );

    // Rebuild the product sections dynamically
    this.buildProductSections(this.product);
  }

  // goToDetails(product: any) {
  //   this.router.navigate(['user/product-details'], {
  //     state: { product, allProducts: [...this.relatedProducts, this.product] }
  //   });
  // }

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

}
