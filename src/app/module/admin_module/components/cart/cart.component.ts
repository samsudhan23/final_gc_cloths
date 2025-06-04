import { Component, ViewChild } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { WishlistService } from '../../service/wishlistService/wishlist.service';
import { AdminProductService } from '../../service/productService/admin-product.service';
import { CartService } from '../../service/cartService/cart.service';


@Component({
  selector: 'app-cart',
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
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  @ViewChild('dt') dt!: Table;
  openDialog: boolean = false;
  selectedUser!: any | null;
  CartList: any[] = [];
  productData: any = [];
  usersList: any[] = [];
  mode: 'add' | 'edit' | 'view' = 'add';
  currentId: string | null = null;
  cartForm: FormGroup;
  dressSizesWithMeasurements = [];
  constructor(
    private userService: UserService,
    private wishservice: WishlistService,
    private cartService: CartService,
    private product: AdminProductService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private toast: ToastrService,
  ) {
    this.cartForm = this.fb.group({
      userId: ['', Validators.required],
      productId: ['', Validators.required],
      selectedSize: ['', Validators.required],
      quantity: [1, Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers()
    this.getCartlist();
    this.productList();
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
      }
    }, (error: any) => {
      this.toast.error(error.message)
    })
  }

  // Category Module
  getCartlist(): void {
    this.cartService.getCartList().subscribe((res: any) => {
      if (res.success === true || res.code === 200) {
        this.CartList = res.result;
        console.log('this.CartList: ', this.CartList);
      }
    }, (error: any) => {
      this.toast.error(error.message)
    })
  }

  selectProduct(event: any) {
    const obj: any = {}
    const data = event.value
    console.log('data: ', this.productData);
    this.dressSizesWithMeasurements = this.productData.filter((item: any) => item._id == data)[0].sizes
    this.dressSizesWithMeasurements.forEach((ite: any) => {
      obj['label'] = ite
      console.log('obj: ', obj);
      return obj;
    })
    console.log('this.dressSizesWithMeasurements: ', this.dressSizesWithMeasurements);
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
      message: 'Are you sure you want to delete the selected Wishlist?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const dele = {
          ids: this.selectedUser.map((ite: { _id: any; }) => ite._id)
        }
        this.wishservice.deleteWishList(dele).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getCartlist();
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
        this.wishservice.deleteWishList(dele).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getCartlist();
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
    this.cartForm.reset();
  }

  onDialogHide() {
    if (this.cartForm) {
      this.cartForm.reset(); // Reset when dialog is closed using header 'X'
    }
  }
  edit(event: any, type: string) {
    const editTableDatas = event
    this.openDialog = true;

    switch (type) {
      case "Edit":
        this.mode = 'edit';
        this.currentId = editTableDatas._id;
        this.cartForm.patchValue({
          userId: editTableDatas.userId._id,
          productId: editTableDatas.productId._id,
        });
        this.cartForm.enable();
        break;
      case "View":
        this.mode = 'view';
        this.cartForm.patchValue({
          userId: editTableDatas?.userId._id,
          productId: editTableDatas?.productId._id,
        });
        this.cartForm.disable();
        break;
    }

  }
  save() {
    if (this.cartForm.invalid) {
      this.cartForm.markAllAsTouched();
    }
    if (this.cartForm.valid) {
      const data = this.cartForm.value;

      if (this.mode === 'add') {
        this.wishservice.postWishlist(data).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getCartlist();
            this.hideDialog();
          }
          else {
            this.toast.error(res.message);
          }
        }, (error) => {
          this.toast.error(error.error.message);
        });
      } else if (this.mode === 'edit' && this.currentId) {
        this.wishservice.updateWishList(this.currentId, data).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getCartlist();
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
