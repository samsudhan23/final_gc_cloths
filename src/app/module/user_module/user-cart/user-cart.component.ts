import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { CartService } from '../../admin_module/service/cartService/cart.service';
import { apiResponse } from '../../../shared/interface/response';
import { CartItem } from '../../../shared/interface/cart.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-cart',
  imports: [CommonModule, ButtonModule, FormsModule, Select, ReactiveFormsModule],
  templateUrl: './user-cart.component.html',
  styleUrl: './user-cart.component.scss'
})
export class UserCartComponent {
  selectedCity: any | undefined = '';
  deliveryCharge: number = 5.99;
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

  constructor(
    private cartService: CartService,
    private toast: ToastrService,
    private fb: FormBuilder
  ) {

  }
  ngOnInit() {
    this.getCartList();
    this.cartFormArray = this.fb.array([]);
  }


  getCartList() {
    this.cartService.getCartList().subscribe((res: apiResponse) => {
      console.log('res: ', res);
      if (res?.code === 200 && res?.success === true) {
        this.allCartList = res?.result;
         this.cartLength = res.result.map(item => item?.quantity).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
         console.log('this.cartLength: ', this.cartLength);
        this.cartService.getLengthOfCart(this.cartLength) //using service to pass lenght of cart
        this.allCartList.forEach((item, i) => {
          this.totalSelectedPrductCost = this.addTotalPrice(item?.productId?.price, this.deliveryCharge)
          // find size object
          const sizeObj = item.productId.sizeStock.find(
            (s: any) => s.size === item.selectedSize
          );

          // generate quantity options based on stock
          this.quantity[i] = this.generateQuantityArray(sizeObj?.stock || 10);
          const selectedQuantityObj = { value: item.quantity || 1 };
          // push form group
          const group = this.fb.group({
            size: [sizeObj],
            quantity: [selectedQuantityObj],
          });

          this.cartFormArray.push(group);
        });
      }
    }, (error) => {
      this.toast.error(error.error.message)
    })
  }
  addTotalPrice(price: number, delivery: number) {
    const sumOfPrice = price + price
    const totalCost = sumOfPrice + delivery
    return {
      "subtotal": sumOfPrice,
      "totalCost": totalCost
    }
  }

  onSizeChange(event: any, i: number) {
    const selectedSize = event.value; // size object
    const stock = selectedSize?.stock || 1;

    // regenerate quantity options for this specific item
    this.quantity[i] = this.generateQuantityArray(stock);

    // reset the quantity value to 1
    this.cartFormArray.at(i).get('quantity')?.setValue(1);
  }
  //Generate quantity array value based on size stock
  generateQuantityArray(stock: number) {
    return Array.from({ length: stock }, (_, i) => ({ value: i + 1 }));
  }

  getFormGroup(index: number): FormGroup {
    return this.cartFormArray.at(index) as FormGroup;
  }


  deleteCart(data: any) {
    const dele = {
      ids: data._id
    }
    this.cartService.deleteCartItem(dele).subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.toast.success('Cart Removed Successfully');
        this.getCartList();
      } else {
        this.toast.error(res.message);
      }
    }, (error) => {
      this.toast.error(error.error.message);
    });

  }
}
