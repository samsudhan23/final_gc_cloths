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
import { SupplierManagementService } from '../../service/supplier-management.service';
import { PurchaseOrderService } from '../../service/purchaseOrder/purchase-order.service';

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
  selector: 'app-purchase-order',
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
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.scss'
})
export class PurchaseOrderComponent {
@ViewChild('dt') dt!: Table;
  userDialog: boolean = false;
  selectedUser!: any | null;
  supplierList: any[] = [];
  purchaseOrderList: any[] = [];
  exportColumns!: ExportColumn[];
  mode: 'add' | 'edit' | 'view' = 'add';
  currentUserId: string | null = null;
  rolePeremission: any[] = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ];
  cols: Column[] = [
    { field: 'supplierName', header: 'supplierName' },
    { field: 'purchaseItem', header: 'purchaseItem' },
    { field: 'Order Date', header: 'orderDate' },
    { field: 'Expexted Date', header: 'expextedDate' },
    { field: 'Status', header: 'status' }
  ];
  purchaseOrderForm: FormGroup;
  constructor(
    private supplierService: SupplierManagementService,
    private purchaseOrderService: PurchaseOrderService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private toast: ToastrService,
  ) {
    this.purchaseOrderForm = this.fb.group({
      supplierId:['',Validators.required],
      purchaseItem: ['', Validators.required],
      orderDate: ['', Validators.required],
      expextedDate: ['', Validators.required],
      status :[false]
    });
  }

  ngOnInit() {
    this.getSupplierList();
    this.getPurchaseOrderList();
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  getSupplierList() {
    this.supplierService.getSupplierList().subscribe((res: any) => {
      if (res.code === 200 && res.status === true) {
        this.supplierList = res.result
      }
    })
  }

  // Purchase Order Grid
  getPurchaseOrderList(): void {
    this.purchaseOrderService.getPurchaseOrderList().subscribe((res: any) => {
      this.purchaseOrderList = res.result;
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
      message: 'Are you sure you want to delete the selected Purchase Orders?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const dele = {
          ids: this.selectedUser.map((ite: { _id: any; }) => ite._id)
        }

        this.purchaseOrderService.deletePurchaseOrder(dele).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getPurchaseOrderList();
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
      message: 'Are you sure you want to delete ' + user.purchaseItem + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const dele = {
          ids: user._id
        }
        this.purchaseOrderService.deletePurchaseOrder(dele).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getPurchaseOrderList();
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
    this.purchaseOrderForm.reset();
  }

  onDialogHide() {
    if (this.purchaseOrderForm) {
      this.purchaseOrderForm.reset(); // Reset when dialog is closed using header 'X'
    }
  }
  editUser(event: any, type: string) {
    const editTableDatas = event
    this.userDialog = true;

    switch (type) {
      case "Edit":
        this.mode = 'edit';
        this.currentUserId = editTableDatas._id;
        this.purchaseOrderForm.patchValue(editTableDatas);
        this.purchaseOrderForm.enable();
        break;
      case "View":
        this.mode = 'view';
        this.purchaseOrderForm.patchValue(editTableDatas);
        this.purchaseOrderForm.disable();
        break;
    }

  }
  saveProduct() {
    if (this.purchaseOrderForm.invalid) {
      this.purchaseOrderForm.markAllAsTouched();
    }
    if (this.purchaseOrderForm.valid) {
      const user = this.purchaseOrderForm.value;

      if (this.mode === 'add') {
        this.purchaseOrderService.postPurchaseOrder(user).subscribe((res: any) => {
          if (res.code === 200) {
            this.toast.success(res.message);
            this.getPurchaseOrderList();
            this.hideDialog();
          }
        },
          (error: any) => {
            this.toast.warning(error.error.message);
          });
      } else if (this.mode === 'edit' && this.currentUserId) {
        this.purchaseOrderService.updatePurchaseOrder(this.currentUserId, user).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getPurchaseOrderList();
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
