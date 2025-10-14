import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { CartService } from '../../admin_module/service/cartService/cart.service';
import { apiResponse } from '../../../shared/interface/response';
import { CartItem } from '../../../shared/interface/cart.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-cart',
  imports: [CommonModule, ButtonModule, FormsModule, Select],
  templateUrl: './user-cart.component.html',
  styleUrl: './user-cart.component.scss'
})
export class UserCartComponent {
  cities: any[] | undefined;
  selectedCity: any | undefined;
  cart: any = [];
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
  quantity = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
  ]
  allCartList: CartItem[] = [];
  constructor(
    private cartService: CartService,
    private toast: ToastrService
  ) {

  }
  ngOnInit() {
    this.getCartList();
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' }
    ];
  }

  getCartList() {
    this.cartService.getCartList().subscribe((res: apiResponse) => {
      console.log('res: ', res);
      if (res?.code === 200 && res?.success === true) {
        this.allCartList = res?.result;
        console.log('this.allCartList: ', this.allCartList);
      }
    }, (error) => {
      this.toast.error(error.error.message)
    })
  }
}
