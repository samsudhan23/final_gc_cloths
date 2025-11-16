import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { CartService } from '../../admin_module/service/cartService/cart.service';
import { apiResponse } from '../../../shared/interface/response';
import { CartItem } from '../../../shared/interface/cart.model';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AdminProductService } from '../../admin_module/service/productService/admin-product.service';
import { EncryptionService } from '../../../shared/service/encryption.service';

@Component({
  selector: 'app-user-cart',
  imports: [CommonModule, ButtonModule, FormsModule, Select, ReactiveFormsModule, CheckboxModule],
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
  selectedItems: Set<string> = new Set(); // Track selected cart items by their unique ID
  selectAll: boolean = false;

  constructor(
    private cartService: CartService,
    private toast: ToastrService,
    private fb: FormBuilder,
    private router: Router,
    private productService: AdminProductService,
    private encryptionService: EncryptionService
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
            this.selectedItems.clear(); // Clear previous selections
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
              
              // Select all items by default
              const itemId = this.getItemId(item);
              this.selectedItems.add(itemId);
            });
            this.selectAll = true; // All items selected by default
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
      
      this.allCartList = guestCart;

      this.cartLength = guestCart
        .map((item: any) => item?.quantity)
        .reduce((acc: any, cur: any) => acc + cur, 0);
      this.cartService.getLengthOfCart(this.cartLength);

      // form array setup
      this.cartFormArray.clear(); // clear before reassigning
      this.selectedItems.clear(); // Clear previous selections
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
        
        // Select all items by default
        const itemId = this.getItemId(item);
        this.selectedItems.add(itemId);
      });
      this.selectAll = true; // All items selected by default
      // ✅ calculate totals after building the cart
      this.calculateTotal();
    }
  }

  calculateTotal() {
    let subtotal = 0;

    // Only calculate for selected items
    this.allCartList.forEach((item) => {
      const itemId = this.getItemId(item);
      if (this.selectedItems.has(itemId)) {
        const price = item.productId?.price || 0;
        const quantity = item.quantity || 1;
        subtotal += price * quantity;
      }
    });

    this.totalSelectedPrductCost = {
      subtotal: subtotal,
      totalCost: subtotal + this.deliveryCharge,
    };

    
  }

  // Get unique ID for cart item (combination of product ID and size)
  getItemId(item: any): string {
    return `${item._id || item.productId?._id}_${item.selectedSize || 'default'}`;
  }

  // Handle checkbox change for individual item
  onItemSelect(item: any, checked: boolean) {
    const itemId = this.getItemId(item);
    if (checked) {
      this.selectedItems.add(itemId);
    } else {
      this.selectedItems.delete(itemId);
    }
    this.updateSelectAllState();
    this.calculateTotal();
  }

  // Check if item is selected
  isItemSelected(item: any): boolean {
    const itemId = this.getItemId(item);
    return this.selectedItems.has(itemId);
  }

  // Handle select all checkbox
  onSelectAll(checked: boolean) {
    this.selectAll = checked;
    this.selectedItems.clear();
    if (checked) {
      this.allCartList.forEach((item) => {
        const itemId = this.getItemId(item);
        this.selectedItems.add(itemId);
      });
    }
    this.calculateTotal();
  }

  // Update select all state based on current selections
  updateSelectAllState() {
    if (this.allCartList.length === 0) {
      this.selectAll = false;
      return;
    }
    this.selectAll = this.allCartList.every((item) => {
      const itemId = this.getItemId(item);
      return this.selectedItems.has(itemId);
    });
  }

  // Get selected cart items for checkout
  getSelectedCartItems(): CartItem[] {
    return this.allCartList.filter((item) => {
      const itemId = this.getItemId(item);
      return this.selectedItems.has(itemId);
    });
  }

  // Proceed to checkout with selected items
  proceedToCheckout() {
    const selectedItems = this.getSelectedCartItems();
    if (selectedItems.length === 0) {
      this.toast.warning('Please select at least one item to proceed to checkout');
      return;
    }
    // TODO: Navigate to checkout page with selected items
    
    this.toast.success(`${selectedItems.length} item(s) selected for checkout`);
    // Navigate to checkout page or process order
    // this.router.navigate(['user/checkout'], { state: { selectedItems } });
  }
  onQuantityChange(event?: any, cartData?: any) {
    
    this.updateCart(event?.value?.value, cartData);
    // Recalculate total after quantity change
    this.calculateTotal();
  }
  updateCart(quantity: any, cartData: any) {
    let data = {
      userId: cartData?.userId._id,
      productId: cartData?.productId._id,
      quantity: quantity,
      selectedSize: this.selectedSize ? this.selectedSize : cartData?.selectedSize
    }
    
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
    
    // Recalculate total after size change
    this.calculateTotal();
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

    // Remove from selected items before deleting
    const itemId = this.getItemId(data);
    this.selectedItems.delete(itemId);

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
      this.updateSelectAllState();
      this.calculateTotal();
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
    // Encrypt product ID and pass it in URL
    const encryptedId = this.encryptionService.encrypt(product._id);
    this.router.navigate(['user/product-details', encryptedId]);
  }
}
