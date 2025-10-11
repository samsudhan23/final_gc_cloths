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
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from '../../service/category/category.service';
import { ProductVariantService } from '../../service/productVariant/product-variant.service';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-product-variant',
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
  providers: [CustomerService, ConfirmationService, MessageService],
  templateUrl: './product-variant.component.html',
  styleUrl: './product-variant.component.scss'
})
export class ProductVariantComponent {
  @ViewChild('dt') dt!: Table;
  userDialog: boolean = false;
  selectedUser!: any | null;
  categoryList: any[] = [];
  productVariantList: any[] = [];
  exportColumns!: ExportColumn[];
  mode: 'add' | 'edit' | 'view' = 'add';
  currentUserId: string | null = null;
  rolePeremission: any[] = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ];
  cols: Column[] = [
    { field: 'category', header: 'name' },
    { field: 'Name', header: 'name' },
    { field: 'Email', header: 'email' },
    { field: 'Description', header: 'description' },
    { field: 'Role', header: 'role' }
  ];
  productVariantForm: FormGroup;
  constructor(
    private categoryService: CategoryService,
    private productVariantService: ProductVariantService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private toast: ToastrService,
  ) {
    this.productVariantForm = this.fb.group({
      category:['',Validators.required],
      productVariantName: ['', Validators.required],
      productVariantDescription: [''],
      //  isBlocked: [false]
    });
  }

  ngOnInit() {
    this.getCategoryList();
    this.getProductVariantList();
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  getCategoryList() {
    this.categoryService.getCategoriesMasterList().subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.categoryList = res.result
      }
    })
  }

  // Product Variant Grid
  getProductVariantList(): void {
    this.productVariantService.getProductVariantList().subscribe((res: any) => {
      this.productVariantList = res.result;
    }, (error: any) => {
      this.toast.warning(error.error.message);
    })
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  openNew() {
    this.userDialog = true;
    this.mode = 'add';
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected Category?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const dele = {
          ids: this.selectedUser.map((ite: { _id: any; }) => ite._id)
        }

        this.productVariantService.deleteProductVariant(dele).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getProductVariantList();
          }
        },
          (error: any) => {
            this.toast.warning(error.error.message);
          });
      }
    });
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  deleteProduct(user: any) {
    console.log('user: ', user);
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + user.productVariantName + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const dele = {
          ids: user._id
        }
        this.productVariantService.deleteProductVariant(dele).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getProductVariantList();
          }
        },
          (error: any) => {
            this.toast.warning(error.error.message);
          });
      }
    });
  }

  hideDialog() {
    this.userDialog = false;
    this.productVariantForm.reset();
  }

  onDialogHide() {
    if (this.productVariantForm) {
      this.productVariantForm.reset(); // Reset when dialog is closed using header 'X'
    }
  }
  editUser(event: any, type: string) {
    const editTableDatas = event
    this.userDialog = true;

    switch (type) {
      case "Edit":
        this.mode = 'edit';
        this.currentUserId = editTableDatas._id;
        this.productVariantForm.patchValue(editTableDatas);
        this.productVariantForm.enable();
        break;
      case "View":
        this.mode = 'view';
        this.productVariantForm.patchValue(editTableDatas);
        this.productVariantForm.disable();
        break;
    }

  }
  saveProduct() {
    if (this.productVariantForm.invalid) {
      this.productVariantForm.markAllAsTouched();
    }
    if (this.productVariantForm.valid) {
      const user = this.productVariantForm.value;

      if (this.mode === 'add') {
        this.productVariantService.postProductVariant(user).subscribe((res: any) => {
          if (res.code === 200) {
            this.toast.success(res.message);
            this.getProductVariantList();
            this.hideDialog();
          }
        },
          (error: any) => {
            this.toast.warning(error.error.message);
          });
      } else if (this.mode === 'edit' && this.currentUserId) {
        this.productVariantService.updateProductVariant(this.currentUserId, user).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getProductVariantList();
            this.hideDialog();
          }
        },
          (error: any) => {
            this.toast.warning(error.error.message);
          });
      }
    }
  }
}
