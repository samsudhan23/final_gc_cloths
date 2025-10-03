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
  selector: 'app-warehouse',
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
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss'
})
export class WarehouseComponent {
  @ViewChild('dt') dt!: Table;
  userDialog: boolean = false;
  selectedUser!: any | null;
  warehouseList: any[] = [];
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
  userForm: FormGroup;
  constructor(
    private categoryService: CategoryService,
    private warehouseService: WarehouseService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private toast: ToastrService,
  ) {
    this.userForm = this.fb.group({
      warehouseName: ['', Validators.required],
      address: ['',Validators.required],
      contactPerson: ['', Validators.required],
      phone: ['',Validators.required],
      //  isBlocked: [false]
    });
  }

  ngOnInit() {
    this.getWarehouseList();
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  // Category Module
  getWarehouseList(): void {
    this.warehouseService.getWareHouseList().subscribe((res: any) => {
      this.warehouseList = res.result;
      console.log('this.warehouseList: ', this.warehouseList);
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

        this.warehouseService.deleteWareHouse(dele).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getWarehouseList();
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
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + user.warehouseName + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const dele = {
          ids: user._id
        }
        this.warehouseService.deleteWareHouse(dele).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getWarehouseList();
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
    this.userForm.reset();
  }

  onDialogHide() {
    if (this.userForm) {
      this.userForm.reset(); // Reset when dialog is closed using header 'X'
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
        this.userForm.patchValue(editTableDatas);
        this.userForm.enable();
        break;
      case "View":
        this.mode = 'view';
        this.userForm.patchValue(editTableDatas);
        this.userForm.disable();
        break;
    }

  }
  saveProduct() {
    debugger
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
    }
    if (this.userForm.valid) {
      const user = this.userForm.value;
      console.log('user: ', user);
      if (this.mode === 'add') {
        this.warehouseService.postWareHouse(user).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getWarehouseList();
            this.hideDialog();
          }
        },
          (error: any) => {
            this.toast.warning(error.error.message);
          });
      } else if (this.mode === 'edit' && this.currentUserId) {
        this.warehouseService.updateWareHouse(this.currentUserId, user).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.getWarehouseList();
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
