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
import { ProductService } from '../../../../pages/service/product.service';
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
  selector: 'app-user-management',
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
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  @ViewChild('dt') dt!: Table;
  userDialog: boolean = false;
  selectedUser!: any | null;
  usersList: any[] = [];
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
    { field: 'Phone', header: 'phoneNumber' },
    { field: 'Role', header: 'role' }
  ];
  userForm: FormGroup;
  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private toast: ToastrService,
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
      role: ['user', Validators.required],
      isBlocked: [false]
    });
  }

  ngOnInit() {
    this.loadUsers()
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  // User Module
  loadUsers(): void {
    this.userService.getUsers().subscribe((res: any) => {
      this.usersList = res.result;
    }, (error: any) => {
      console.log('error: ', error);

    })
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  openNew() {
    this.userDialog = true;
    this.mode = 'add'
    this.userForm.get('role')?.setValue('user')
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected User?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(this.selectedUser[0]._id).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.loadUsers()
          }
        });
      }
    });
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  deleteProduct(user: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + user.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user._id).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.loadUsers()
          }
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
    const editTableDatas = event
    this.userDialog = true;

    switch (type) {
      case "Edit":
        this.mode = 'edit';
        this.currentUserId = editTableDatas._id;
        console.log('editTableDatas: ', editTableDatas);
        this.userForm.patchValue(editTableDatas);
        this.userForm.patchValue({
          dateOfBirth: new Date(editTableDatas.dateOfBirth)
        });
        // this.userForm.get('password')?.setValue('');
        this.userForm.enable();
        break;
      case "View":
        this.mode = 'view';
        this.userForm.patchValue(editTableDatas);
        this.userForm.patchValue({
          dateOfBirth: new Date(editTableDatas.dateOfBirth)
        });
        this.userForm.disable();
        break;
    }

  }
  saveProduct() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
    }
    if (this.userForm.valid) {
      const user = this.userForm.value;

      if (this.mode === 'add') {
        this.userService.addUser(user).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.loadUsers();
            this.hideDialog();
          }
        });
      } else if (this.mode === 'edit' && this.currentUserId) {
        this.userService.updateUser(this.currentUserId, user).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.loadUsers();
            this.hideDialog();
          }
        });
      }
    }
  }
}
