import { Component, ViewChild } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { DatePickerModule } from 'primeng/datepicker';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { CustomerService } from '../../../../pages/service/customer.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { UserService } from '../../service/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { AdminProductService } from '../../service/productService/admin-product.service';
import { CartService } from '../../service/cartService/cart.service';
import { PlaceOrderService } from '../../service/place_orders/place-order.service';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-order-management',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    MultiSelectModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    DatePickerModule,
    CheckboxModule,
    ReactiveFormsModule
  ],
  providers: [CustomerService, ConfirmationService, MessageService, UserService, AdminProductService],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.scss'
})
export class OrderManagementComponent {
  @ViewChild('dt') dt!: Table;
  openDialog: boolean = false;
  selectedUser!: any | null;
  CartList: any[] = [];
  usersList: any[] = [];
  productData: any = [];
  orderList: any[] = [];
  mode: 'add' | 'edit' | 'view' = 'add';
  currentId: string | null = null;
  orderForm: FormGroup;
  dressSizesWithMeasurements: any[] = [];
  constructor(
    private userService: UserService,
    private orderService: PlaceOrderService,
    private cartService: CartService,
    private product: AdminProductService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private toast: ToastrService,
  ) {
    this.orderForm = this.fb.group({
      userId: ['', Validators.required],
      productId: ['', Validators.required],
      selectedSize: ['', Validators.required],
      totalQuantity: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.loadOrderList()
    this.loadUsers();
    this.productList();
  }

  get quantityControls(): FormArray {
    return this.orderForm.get('totalQuantity') as FormArray;
  }

  // User List
  loadUsers(): void {
    this.userService.getUsers().subscribe((res: any) => {
      this.usersList = res.result.filter((item: { role: string; }) => item.role === "user");
    }, (error: any) => {
      this.toast.error(error.message)
    })
  }


  productList() {
    this.product.getProductlist().subscribe((res) => {
      if (res.success === true || res.code === 200) {
        this.productData = res.result
        console.log('this.productData : ', this.productData);
      }
    }, (error: any) => {
      this.toast.error(error.message)
    })
  }

  // Category Module
  loadOrderList(): void {
    this.orderService.getOrderslist().subscribe((res: any) => {
      this.orderList = res.result;
    }, (error: any) => {
      this.toast.error(error.message)
    })
  }

  selectProduct(event: any) {
    const selectedProductIds = event.value || [];

    this.dressSizesWithMeasurements = selectedProductIds //get size if selected product
      .map((productId: string) => {
        const product = this.productData.find((item: any) => item._id === productId);
        if (!product?.sizeStock?.length) return null;
        return {
          label: product.productName,
          items: product.sizeStock.map((e: any) => ({
            label: e.size,
            value: `${product._id}_${e.size}`
          }))
        };
      })
      .filter(Boolean); // Removes null entries
  }
  selectedSizes: any[] = [];

  selectSizes(event: any) {
    console.log('event: ', event);
    this.selectedSizes = [event.itemValue];
    console.log('this.selectedSizes: ', this.selectedSizes);
    const updatedArray: FormArray = this.fb.array([]);
    this.selectedSizes.forEach(size => {
      updatedArray.push(this.fb.group({
        quantity: [size.value],
        selectedSize:[size.label]
      }));
    });
    this.orderForm.setControl('totalQuantity', updatedArray);
    console.log('this.orderForm: ', this.orderForm.value);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  openNew() {
    this.openDialog = true;
    this.mode = 'add';
  }

  deleteSelectedWishlist() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected Cart?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const dele = {
          ids: this.selectedUser.map((ite: { _id: any; }) => ite._id)
        }
        this.cartService.deleteCartItem(dele).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.loadOrderList();
          } else {
            this.toast.error(res.message);
          }
        }, (error) => {
          this.toast.error(error.error.message);
        });
      }
    });
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  delete(data: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + data.productId.productName + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const dele = {
          ids: data._id
        }
        this.cartService.deleteCartItem(dele).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.loadOrderList();
          } else {
            this.toast.error(res.message);
          }
        }, (error) => {
          this.toast.error(error.error.message);
        });
      }
    });
  }

  hideDialog() {
    this.openDialog = false;
    this.orderForm.reset();
    this.orderForm.get('quantity')?.setValue(1)
  }

  onDialogHide() {
    if (this.orderForm) {
      this.orderForm.reset(); // Reset when dialog is closed using header 'X'
      this.orderForm.get('quantity')?.setValue(1)
    }
  }
  edit(event: any, type: string) {
    const editTableDatas = event
    this.openDialog = true;
    this.dressSizesWithMeasurements = this.productData.find((item: any) => item._id === editTableDatas.productId._id)
      ?.sizes.map((ite: string) => ({ label: ite })) || [];
    switch (type) {
      case "Edit":
        this.mode = 'edit';
        this.currentId = editTableDatas._id;
        this.orderForm.patchValue({
          userId: editTableDatas.userId._id,
          productId: editTableDatas.productId._id,
          selectedSize: editTableDatas.selectedSize,
          quantity: editTableDatas.quantity,
        });
        this.orderForm.enable();
        break;
      case "View":
        this.mode = 'view';
        this.orderForm.patchValue({
          userId: editTableDatas?.userId._id,
          productId: editTableDatas?.productId._id,
          selectedSize: editTableDatas.selectedSize,
          quantity: editTableDatas.quantity,
        });
        this.orderForm.disable();
        break;
    }

  }
  save() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
    }
    if (this.orderForm.valid) {
      const data = this.orderForm.value;

      if (this.mode === 'add') {
        this.cartService.postCart(data).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.loadOrderList();
            this.hideDialog();
          }
          else {
            this.toast.error(res.message);
          }
        }, (error) => {
          this.toast.error(error.error.message);
        });
      } else if (this.mode === 'edit' && this.currentId) {
        this.cartService.updateCartItem(this.currentId, data).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.loadOrderList();
            this.hideDialog();
          }
          else {
            this.toast.error(res.message);
          }
        }, (error) => {
          this.toast.error(error.error.message);
        });
      }
    }
  }
}
