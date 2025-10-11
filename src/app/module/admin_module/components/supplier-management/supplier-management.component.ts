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
import { WarehouseService } from '../../service/warehouse/warehouse.service';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { SupplierManagementService } from '../../service/supplier-management.service';

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
  selector: 'app-supplier-management',
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
      InputGroupModule,
      InputGroupAddonModule,
      ReactiveFormsModule
    ],
    providers: [CustomerService, ConfirmationService, MessageService],  
  templateUrl: './supplier-management.component.html',
  styleUrl: './supplier-management.component.scss'
})
export class SupplierManagementComponent {

  @ViewChild('dt') dt!: Table;
    userDialog: boolean = false;
    selectedUser!: any | null;
    supplierList: any[] = [];
    exportColumns!: ExportColumn[];
    mode: 'add' | 'edit' | 'view' = 'add';
    currentUserId: string | null = null;
    rolePeremission: any[] = [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ];
    cols: Column[] = [
      { field: 'Name', header: 'name' },
      { field: 'Email', header: 'email' },
      { field: 'Description', header: 'description' },
      { field: 'Role', header: 'role' }
    ];
    supplierForm: FormGroup;
    constructor(
      private supplierService: SupplierManagementService,
      private confirmationService: ConfirmationService,
      private fb: FormBuilder,
      private toast: ToastrService,
    ) {
      this.supplierForm = this.fb.group({
        supplierName: ['', Validators.required],
        address: ['',Validators.required],
        contactPerson: ['', Validators.required],
        price: ['',Validators.required],
        //  isBlocked: [false]
      });
    }
  
    ngOnInit() {
      this.getSupplierList();
      this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }
  
    // Category Module
    getSupplierList(): void {
      this.supplierService.getSupplierList().subscribe((res: any) => {
        this.supplierList = res.result;
        console.log('this.supplierList: ', this.supplierList);
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
  
          this.supplierService.deleteSupplier(dele).subscribe((res: any) => {
            if (res.code === 200 && res.success === true) {
              this.toast.success(res.message);
              this.getSupplierList();
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
        message: 'Are you sure you want to delete ' + user.supplierName + '?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          const dele = {
            ids: user._id
          }
          this.supplierService.deleteSupplier(dele).subscribe((res: any) => {
            if (res.code === 200 && res.success === true) {
              this.toast.success(res.message);
              this.getSupplierList();
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
      this.supplierForm.reset();
    }
  
    onDialogHide() {
      if (this.supplierForm) {
        this.supplierForm.reset(); // Reset when dialog is closed using header 'X'
      }
    }
    editUser(event: any, type: string) {
      console.log('event: ', event);
      const editTableDatas = event
      this.userDialog = true;
  
      switch (type) {
        case "Edit":
          this.mode = 'edit';
          this.currentUserId = editTableDatas._id;
          this.supplierForm.patchValue(editTableDatas);
          this.supplierForm.enable();
          break;
        case "View":
          this.mode = 'view';
          this.supplierForm.patchValue(editTableDatas);
          this.supplierForm.disable();
          break;
      }
  
    }
    saveProduct() {
      if (this.supplierForm.invalid) {
        this.supplierForm.markAllAsTouched();
      }
      if (this.supplierForm.valid) {
        const user = this.supplierForm.value;
        console.log('user: ', user);
        if (this.mode === 'add') {
          this.supplierService.postSupplier(user).subscribe((res: any) => {
            if (res.code === 200 && res.status === true) {
              this.toast.success(res.message);
              this.getSupplierList();
              this.hideDialog();
            }
          },
            (error: any) => {
              this.toast.warning(error.error.message);
            });
        } else if (this.mode === 'edit' && this.currentUserId) {
          this.supplierService.updateSupplier(this.currentUserId, user).subscribe((res: any) => {
            if (res.code === 200 && res.success === true) {
              this.toast.success(res.message);
              this.getSupplierList();
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
