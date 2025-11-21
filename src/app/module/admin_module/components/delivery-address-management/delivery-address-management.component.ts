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
import { DeliveryAddressService } from '../../service/delivery-address/delivery-address.service';
import { UserService } from '../../service/user/user.service';

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
  selector: 'app-delivery-address-management',
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
  templateUrl: './delivery-address-management.component.html',
  styleUrl: './delivery-address-management.component.scss'
})
export class DeliveryAddressManagementComponent {
  @ViewChild('dt') dt!: Table;
  addressDialog: boolean = false;
  selectedAddress!: any | null;
  addressList: any[] = [];
  usersList: any[] = [];
  exportColumns!: ExportColumn[];
  mode: 'add' | 'edit' | 'view' = 'add';
  currentAddressId: string | null = null;
  cols: Column[] = [
    { field: 'fullName', header: 'Full Name' },
    { field: 'addressLine', header: 'Address' },
    { field: 'city', header: 'City' },
    { field: 'state', header: 'State' },
    { field: 'postalCode', header: 'Postal Code' },
    { field: 'phone', header: 'Phone' },
    { field: 'isDefault', header: 'Default' }
  ];
  addressForm: FormGroup;
  
  constructor(
    private deliveryAddressService: DeliveryAddressService,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private toast: ToastrService,
  ) {
    this.addressForm = this.fb.group({
      userId: ['', Validators.required],
      fullName: ['', Validators.required],
      addressLine: ['', Validators.required],
      landmark: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      country: ['India', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      alternatePhoneNumber: ['', Validators.pattern(/^[6-9]\d{9}$/)],
      isDefault: [false]
    });
  }

  ngOnInit() {
    this.loadAddresses();
    this.loadUsers();
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  loadAddresses(): void {
    this.deliveryAddressService.getAllDeliveryAddresses().subscribe((res: any) => {
      this.addressList = res.result || [];
    }, (error: any) => {
      this.toast.warning(error.error?.message || 'Failed to load delivery addresses');
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((res: any) => {
      this.usersList = res.result || [];
    }, (error: any) => {
      this.toast.warning(error.error?.message || 'Failed to load users');
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.addressDialog = true;
    this.mode = 'add';
    this.addressForm.reset();
    this.addressForm.get('country')?.setValue('India');
    this.addressForm.get('isDefault')?.setValue(false);
  }

  deleteSelectedAddresses() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected delivery address(es)?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteData = {
          ids: this.selectedAddress.map((item: { _id: any; }) => item._id)
        };
        this.deliveryAddressService.deleteDeliveryAddress(deleteData).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.loadAddresses();
            this.selectedAddress = null;
          } else {
            this.toast.error(res.message || 'Failed to delete addresses');
          }
        }, (error: any) => {
          this.toast.error(error.error?.message || 'Server error occurred');
        });
      }
    });
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  deleteAddress(address: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this delivery address?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteData = {
          ids: [address._id]
        };
        this.deliveryAddressService.deleteDeliveryAddress(deleteData).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.loadAddresses();
          } else {
            this.toast.error(res.message || 'Failed to delete address');
          }
        }, (error: any) => {
          this.toast.error(error.error?.message || 'Server error occurred');
        });
      }
    });
  }

  hideDialog() {
    this.addressDialog = false;
    this.addressForm.reset();
    this.addressForm.get('country')?.setValue('India');
    this.addressForm.get('isDefault')?.setValue(false);
    this.currentAddressId = null;
  }

  onDialogHide() {
    if (this.addressForm) {
      this.addressForm.reset();
      this.addressForm.get('country')?.setValue('India');
      this.addressForm.get('isDefault')?.setValue(false);
      this.currentAddressId = null;
    }
  }

  editAddress(event: any, type: string) {
    const editTableData = event;
    this.addressDialog = true;

    switch (type) {
      case "Edit":
        this.mode = 'edit';
        this.currentAddressId = editTableData._id;
        this.addressForm.patchValue({
          userId: editTableData.userId?._id || editTableData.userId,
          fullName: editTableData.fullName,
          addressLine: editTableData.addressLine,
          landmark: editTableData.landmark || '',
          city: editTableData.city,
          state: editTableData.state,
          postalCode: editTableData.postalCode,
          country: editTableData.country || 'India',
          phone: editTableData.phone,
          alternatePhoneNumber: editTableData.alternatePhoneNumber || '',
          isDefault: editTableData.isDefault || false
        });
        this.addressForm.enable();
        break;
      case "View":
        this.mode = 'view';
        this.addressForm.patchValue({
          userId: editTableData.userId?._id || editTableData.userId,
          fullName: editTableData.fullName,
          addressLine: editTableData.addressLine,
          landmark: editTableData.landmark || '',
          city: editTableData.city,
          state: editTableData.state,
          postalCode: editTableData.postalCode,
          country: editTableData.country || 'India',
          phone: editTableData.phone,
          alternatePhoneNumber: editTableData.alternatePhoneNumber || '',
          isDefault: editTableData.isDefault || false
        });
        this.addressForm.disable();
        break;
    }
  }

  saveAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const addressData = this.addressForm.value;

    if (this.mode === 'add') {
      this.deliveryAddressService.addDeliveryAddress(addressData).subscribe((res: any) => {
        if (res.code === 200 && res.success === true) {
          this.toast.success(res.message);
          this.loadAddresses();
          this.hideDialog();
        } else {
          this.toast.error(res.message || 'Something went wrong');
        }
      }, (err) => {
        this.toast.error(err?.error?.message || 'Server error occurred');
      });
    } else if (this.mode === 'edit' && this.currentAddressId) {
      this.deliveryAddressService.updateDeliveryAddress(this.currentAddressId, addressData).subscribe((res: any) => {
        if (res.code === 200 && res.success === true) {
          this.toast.success(res.message);
          this.loadAddresses();
          this.hideDialog();
        } else {
          this.toast.error(res.message || 'Something went wrong');
        }
      }, (err) => {
        this.toast.error(err?.error?.message || 'Server error occurred');
      });
    }
  }

  getUserName(address: any): string {
    if (address.userId && typeof address.userId === 'object') {
      return address.userId.name || 'N/A';
    }
    return 'N/A';
  }

  getUserEmail(address: any): string {
    if (address.userId && typeof address.userId === 'object') {
      return address.userId.email || 'N/A';
    }
    return 'N/A';
  }
}
