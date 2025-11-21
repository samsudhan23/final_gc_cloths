import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DeliveryAddressService } from '../../admin_module/service/delivery-address/delivery-address.service';
import { AuthenticationService } from '../../../pages/service/authentication.service';

interface Address {
  _id?: string;
  fullName: string;
  addressLine: string; // House / Building
  landmark?: string; // Landmark (mapped from addressLine2)
  addressLine2?: string; // For form compatibility
  city?: string;
  state?: string;
  postalCode?: string; // API field
  pincode?: string; // Form field
  country?: string;
  phone: string; // API field
  phoneNumber?: string; // Form field
  alternatePhoneNumber?: string;
  altPhoneNumber?: string; // Form field
  isDefault?: boolean;
  userId?: any;
}

@Component({
  selector: 'app-deliveryaddress',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    InputMaskModule,
    CheckboxModule,
    ButtonModule,
    MessageModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule,
    RadioButtonModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './deliveryaddress.component.html',
  styleUrls: ['./deliveryaddress.component.scss']
})
export class DeliveryaddressComponent implements OnInit {
  @Input() selectMode: boolean = false; // Enable address selection mode
  @Input() selectedAddressId: any = null; // Currently selected address ID
  @Output() addressSelected = new EventEmitter<Address>(); // Emit selected address

  addressForm!: FormGroup;
  addresses: Address[] = [];
  editingAddressId: any = null;
  showForm: boolean = false;
  countries: string[] = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Other'];
  currentUserId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private confirmationService: ConfirmationService,
    private deliveryAddressService: DeliveryAddressService,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    // Get current user ID
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && (currentUser._id || currentUser.id)) {
      this.currentUserId = currentUser._id || currentUser.id;
    } else {
      // Fallback to localStorage
      const userData = localStorage.getItem('role');
      if (userData) {
        const user = JSON.parse(userData);
        this.currentUserId = user._id || user.id;
      }
    }

    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(50)]],
      addressLine: ['', [Validators.required, Validators.maxLength(120)]],
      addressLine2: ['', [Validators.maxLength(120)]],
      city: ['', [Validators.required, Validators.maxLength(80)]],
      state: ['', [Validators.required, Validators.maxLength(80)]],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{4,10}$/)]],
      country: ['India', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      altPhoneNumber: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
      isDefault: [false]
    });
    
    if (this.currentUserId) {
      this.loadAddresses();
    } else {
      // this.toast.warning('Please login to manage delivery addresses');
    }
  }

  loadAddresses(): void {
    if (!this.currentUserId) {
      this.toast.warning('User not found. Please login again.');
      return;
    }

    this.deliveryAddressService.getDeliveryAddressesByUserId(this.currentUserId).subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        // Map API response to component format
        this.addresses = (res.result || []).map((addr: any) => ({
          _id: addr._id,
          id: addr._id, // For compatibility with existing code
          fullName: addr.fullName,
          addressLine: addr.addressLine,
          landmark: addr.landmark,
          addressLine2: addr.landmark, // For form compatibility
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          pincode: addr.postalCode, // For form compatibility
          country: addr.country,
          phone: addr.phone,
          phoneNumber: addr.phone, // For form compatibility
          alternatePhoneNumber: addr.alternatePhoneNumber,
          altPhoneNumber: addr.alternatePhoneNumber, // For form compatibility
          isDefault: addr.isDefault || false,
          userId: addr.userId
        }));
      }
    }, (error: any) => {
      this.addresses = [];
      this.toast.warning(error.error?.message || 'Failed to load delivery addresses');
    });
  }

  editAddress(address: Address): void {
    this.editingAddressId = address._id || null;
    this.showForm = true;
    this.addressForm.patchValue({
      fullName: address.fullName,
      addressLine: address.addressLine,
      addressLine2: address.addressLine2 || address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || address.postalCode || '',
      country: address.country || 'India',
      phoneNumber: address.phoneNumber || address.phone || '',
      altPhoneNumber: address.altPhoneNumber || address.alternatePhoneNumber || '',
      isDefault: !!address.isDefault
    });
    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('.address-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  addNewAddress(): void {
    this.editingAddressId = null;
    this.showForm = true;
    this.addressForm.reset({
      fullName: '',
      addressLine: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      phoneNumber: '',
      altPhoneNumber: '',
      isDefault: false
    });
    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('.address-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.toast.error('Please fill all required fields correctly');
      return;
    }

    if (!this.currentUserId) {
      this.toast.error('User not found. Please login again.');
      return;
    }

    const formValue = this.addressForm.value;
    
    // Map form fields to API format
    const addressData = {
      userId: this.currentUserId,
      fullName: formValue.fullName,
      addressLine: formValue.addressLine,
      landmark: formValue.addressLine2 || '',
      city: formValue.city,
      state: formValue.state,
      postalCode: formValue.pincode,
      country: formValue.country,
      phone: formValue.phoneNumber,
      alternatePhoneNumber: formValue.altPhoneNumber || '',
      isDefault: formValue.isDefault || false
    };

    if (this.editingAddressId) {
      // Update existing address
      this.deliveryAddressService.updateDeliveryAddress(this.editingAddressId, addressData).subscribe((res: any) => {
        if (res.code === 200 && res.success === true) {
          this.toast.success(res.message || 'Address updated successfully');
          this.loadAddresses();
          this.cancelForm();
        } else {
          this.toast.error(res.message || 'Failed to update address');
        }
      }, (error: any) => {
        this.toast.error(error.error?.message || 'Server error occurred');
      });
    } else {
      // Add new address
      this.deliveryAddressService.addDeliveryAddress(addressData).subscribe((res: any) => {
        if (res.code === 200 && res.success === true) {
          this.toast.success(res.message || 'Address added successfully');
          this.loadAddresses();
          this.cancelForm();
        } else {
          this.toast.error(res.message || 'Failed to add address');
        }
      }, (error: any) => {
        this.toast.error(error.error?.message || 'Server error occurred');
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingAddressId = null;
    this.addressForm.reset({
      fullName: '',
      addressLine: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      phoneNumber: '',
      altPhoneNumber: '',
      isDefault: false
    });
  }

  deleteAddress(id: any): void {
    const address = this.addresses.find(a => a._id === id);
    const addressName = address ? `${address.fullName}` : 'this address';
    const addressId = address?._id;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${addressName}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const deleteData = {
          ids: [addressId]
        };
        this.deliveryAddressService.deleteDeliveryAddress(deleteData).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message || 'Address deleted successfully');
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

  setDefaultAddress(id: any): void {
    const address = this.addresses.find(a => a._id === id);
    const addressId = address?._id;

    if (!addressId) {
      this.toast.error('Address ID not found');
      return;
    }

    this.deliveryAddressService.setDefaultAddress(addressId as string).subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.toast.success(res.message || 'Default address updated successfully');
        this.loadAddresses();
      } else {
        this.toast.error(res.message || 'Failed to set default address');
      }
    }, (error: any) => {
      this.toast.error(error.error?.message || 'Server error occurred');
    });
  }

  // Select address (for checkout mode)
  selectAddress(address: Address): void {
    if (this.selectMode) {
      this.selectedAddressId = address._id || null;
      this.addressSelected.emit(address);
    }
  }

  // Check if address is selected
  isAddressSelected(addressId: number | string | undefined): boolean {
    if (!addressId) return false;
    return this.selectedAddressId === addressId || 
           this.selectedAddressId === (this.addresses.find(a => a._id === addressId));
  }

  getFieldError(fieldName: string): string {
    const field = this.addressForm.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('pattern') && field?.touched) {
      if (fieldName === 'phoneNumber' || fieldName === 'altPhoneNumber') {
        return 'Please enter a valid phone number (10-15 digits)';
      }
      if (fieldName === 'pincode') {
        return 'Please enter a valid pincode (4-10 digits)';
      }
    }
    if (field?.hasError('maxLength') && field?.touched) {
      return `${this.getFieldLabel(fieldName)} is too long`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      fullName: 'Full Name',
      addressLine: 'House No / Building name',
      addressLine2: 'Landmark',
      city: 'City',
      state: 'State',
      pincode: 'Pincode',
      country: 'Country',
      phoneNumber: 'Phone number',
      altPhoneNumber: 'Alternate phone number'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
