import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../admin_module/service/cartService/cart.service';
import { FormsModule } from '@angular/forms';
import { apiResponse } from '../../../shared/interface/response';

@Component({
  selector: 'app-product-details.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.component.component.html',
  styleUrl: './product-details.component.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  product: any;
  selectedImage: string = '';
  selectedSize: string | null = null;
  stock!: number
  relatedProducts: any[] = [];
  quantityValue: any = 1;
  cartLength!: number;
  constructor(
    private router: Router,
    private toast: ToastrService,
    private cartService: CartService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.product = navigation?.extras?.state?.['product'];
    const allProducts = navigation?.extras?.state?.['allProducts'] || [];

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
    }
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
  }

  // goToDetails(product: any) {
  //   this.router.navigate(['user/product-details'], {
  //     state: { product, allProducts: [...this.relatedProducts, this.product] }
  //   });
  // }

  goBack() {
    this.router.navigate(['user/home']);
  }

}
