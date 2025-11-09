import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { CartService } from '../../admin_module/service/cartService/cart.service';
import { apiResponse } from '../../../shared/interface/response';
import { CartItem } from '../../../shared/interface/cart.model';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AdminProductService } from '../../admin_module/service/productService/admin-product.service';

@Component({
  selector: 'app-user-cart',
  imports: [CommonModule, ButtonModule, FormsModule, Select, ReactiveFormsModule],
  templateUrl: './user-cart.component.html',
  styleUrl: './user-cart.component.scss'
})
export class UserCartComponent {
  selectedCity: any | undefined = '';
  deliveryCharge: any = 5.99;
  cart: any = [];
  totalSelectedPrductCost: any = {};
  indicators: any[] = [
    {
      icon: 'shield',
      label: 'Secure Payments',
      description: '100% secure transactions',
    },
    {
      icon: 'refresh',
      label: 'Easy Returns',
      description: '30-day return policy',
    },
    {
      icon: 'truck',
      label: 'Fast Delivery',
      description: 'Free shipping over $50',
    },
  ];
  quantity: any[][] = [];
  allCartList: CartItem[] = [];
  cartFormArray!: FormArray;
  cartLength!: number;
  selectedSize:string ='';

  constructor(
    private cartService: CartService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private router: Router,
    private productService: AdminProductService,
  ) {

  }
  ngOnInit() {
    this.cartFormArray = this.fb.array([]);
    this.getCartList();
  }
  trackByCartItem(index: number, item: any): string {
    // Combine both productId and size to make a unique key
    return `${item.productId?._id || item._id}_${item.selectedSize || 'NA'}`;
  }


  getCartList() {
    const roleString = localStorage.getItem('role');
    const parse = roleString ? JSON.parse(roleString) : null;
    if (parse?.id) {
      this.cartService.getCartList().subscribe(
        (res: apiResponse) => {
          if (res?.code === 200 && res?.success === true) {
            this.allCartList = res?.result;

            // total items count
            this.cartLength = res.result
              .map(item => item?.quantity)
              .reduce((acc, cur) => acc + cur, 0);
            this.cartService.getLengthOfCart(this.cartLength);

            // form array setup
            this.cartFormArray.clear(); // clear before reassigning
            this.allCartList.forEach((item, i) => {
              const sizeObj = item.productId.sizeStock.find(
                (s: any) => s.size === item.selectedSize
              );

              this.quantity[i] = this.generateQuantityArray(sizeObj?.stock || 10);
              const selectedQuantityObj = { value: item.quantity || 1 };

              const group = this.fb.group({
                size: [sizeObj],
                quantity: [selectedQuantityObj],
              });
              this.cartFormArray.push(group);
            });
            // ✅ calculate totals after building the cart
            this.calculateTotal();
          }
        },
        (error) => {
          this.toast.error(error.error.message);
        }
      );
    }
    else {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      console.log('guestCart: ', guestCart);
      this.allCartList = guestCart;

      this.cartLength = guestCart
        .map((item: any) => item?.quantity)
        .reduce((acc: any, cur: any) => acc + cur, 0);
      this.cartService.getLengthOfCart(this.cartLength);

      // form array setup
      this.cartFormArray.clear(); // clear before reassigning
      this.allCartList.forEach((item, i) => {
        const sizeObj = item.productId.sizeStock.find(
          (s: any) => s.size === item.selectedSize
        );

        this.quantity[i] = this.generateQuantityArray(sizeObj?.stock || 10);
        const selectedQuantityObj = { value: item.quantity || 1 };

        const group = this.fb.group({
          size: [sizeObj],
          quantity: [selectedQuantityObj],
        });
        this.cartFormArray.push(group);
      });
      // ✅ calculate totals after building the cart
      this.calculateTotal();
    }
  }

  calculateTotal() {
    let subtotal = 0;

    this.allCartList.forEach((item) => {
      const price = item.productId?.price || 0;
      const quantity = item.quantity || 1;
      subtotal += price * quantity;
    });

    this.totalSelectedPrductCost = {
      subtotal: subtotal,
      totalCost: subtotal + this.deliveryCharge,
    };

    console.log('Calculated Totals:', this.totalSelectedPrductCost);
  }
  onQuantityChange(event?: any, cartData?: any) {
    console.log('event: ', event);
    this.updateCart(event?.value?.value, cartData)
  }
  updateCart(quantity: any, cartData: any) {
    let data = {
      userId: cartData?.userId._id,
      productId: cartData?.productId._id,
      quantity: quantity,
      selectedSize: this.selectedSize ? this.selectedSize : cartData?.selectedSize
    }
    console.log(this.cartFormArray, ' this.cartFormArray');
    this.cartService.updateCartItem(cartData?._id, data).subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.toast.success(res.message);
        this.getCartList();
      }
      else {
        this.toast.error(res.message);
      }
    }, (error) => {
      this.toast.error(error.error.message);
    });
  }

  onSizeChange(event: any, i: number) {
    const selectedSize = event.value; // size object
    this.selectedSize = event?.value?.size
    const stock = selectedSize?.stock || 1;

    // regenerate quantity options for this specific item
    this.quantity[i] = this.generateQuantityArray(stock);

    // reset the quantity value to 1
    this.cartFormArray.at(i).get('quantity')?.setValue(1);
    console.log('this.cartFormArray.at(i): ', this.cartFormArray.at(i).get('size')?.value);
    this.totalSelectedPrductCost = {
      subtotal: 0,
      totalCost: 0,
    };
  }
  //Generate quantity array value based on size stock
  generateQuantityArray(stock: number) {
    return Array.from({ length: stock }, (_, i) => ({ value: i + 1 }));
  }

  getFormGroup(index: number): FormGroup {
    return this.cartFormArray.at(index) as FormGroup;
  }

  deleteCart(data: any) {
    const user = JSON.parse(localStorage.getItem('role') || 'null');

    // 🧾 CASE 1: User is logged in → Use API
    if (user && user.id) {
      const dele = { ids: data._id };
      this.cartService.deleteCartItem(dele).subscribe(
        (res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success('Cart Removed Successfully');
            this.getCartList(); // refresh from backend
          } else {
            this.toast.error(res.message);
          }
        },
        (error) => {
          this.toast.error(error.error.message);
        }
      );
    }
    // 🧾 CASE 2: Guest user → LocalStorage removal
    else {
      let localCart: any[] = JSON.parse(localStorage.getItem('guestCart') || '[]');

      // Remove based on productId + selectedSize to ensure uniqueness
      localCart = localCart.filter(
        (item) =>
          !(
            item._id === data._id &&
            item.selectedSize === data.selectedSize
          )
      );

      localStorage.setItem('guestCart', JSON.stringify(localCart));
      this.allCartList = localCart;
      this.toast.success('Cart Removed Successfully');
      this.getCartLength();
    }
  }

  // Cart Length for without login
  getCartLength() {
    const roleString = localStorage.getItem('role');
    const parse = roleString ? JSON.parse(roleString) : null;
    if (!parse && !parse?.id) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      this.cartLength = guestCart;
      this.cartLength = guestCart.map((item: any) => item?.quantity).reduce((accumulator: any, currentValue: any) => accumulator + currentValue, 0)
      this.cartService.getLengthOfCart(this.cartLength)
    }
  }

  goToProductShoping() {
    this.router.navigate(['user/home'])
  }

  goToProduct(product: any) {
    this.productService.setSelectedProdID(product._id)
    this.router.navigate(['user/product-details'])
  }
}
