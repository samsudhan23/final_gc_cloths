import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

interface Address {
  id: number;
  firstName: string;
  lastName: string;
  addressLine1: string; // House / Building
  addressLine2?: string; // Landmark
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phoneNumber: string;
  altPhoneNumber?: string;
  isDefault?: boolean;
}

@Component({
  selector: 'app-deliveryaddress',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputMaskModule,
    CheckboxModule,
    ButtonModule,
    MessageModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './deliveryaddress.component.html',
  styleUrls: ['./deliveryaddress.component.scss']
})
export class DeliveryaddressComponent implements OnInit {
  addressForm!: FormGroup;
  addresses: Address[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '221B Baker Street',
      addressLine2: 'Near Central Park',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      country: 'India',
      phoneNumber: '9876543210',
      altPhoneNumber: '9123456780',
      isDefault: true
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Doe',
      addressLine1: '11 Downing Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      phoneNumber: '9000000000'
    }
  ];
  editingAddressId: number | null = null;
  showForm: boolean = false;
  countries: string[] = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Other'];

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.addressForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      addressLine1: ['', [Validators.required, Validators.maxLength(120)]],
      addressLine2: ['', [Validators.maxLength(120)]],
      city: ['', [Validators.required, Validators.maxLength(80)]],
      state: ['', [Validators.required, Validators.maxLength(80)]],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{4,10}$/)]],
      country: ['India', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      altPhoneNumber: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
      isDefault: [false]
    });
  }

  editAddress(address: Address): void {
    this.editingAddressId = address.id;
    this.showForm = true;
    this.addressForm.reset({
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      country: address.country || 'India',
      phoneNumber: address.phoneNumber,
      altPhoneNumber: address.altPhoneNumber || '',
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
      firstName: '',
      lastName: '',
      addressLine1: '',
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
    const value = this.addressForm.value as Address;
    if (value.isDefault) {
      this.addresses = this.addresses.map(a => ({ ...a, isDefault: false }));
    }
    if (this.editingAddressId != null) {
      this.addresses = this.addresses.map(a =>
        a.id === this.editingAddressId ? { ...a, ...value, id: this.editingAddressId! } : a
      );
      this.toast.success('Address updated successfully');
    } else {
      const nextId = Math.max(0, ...this.addresses.map(a => a.id)) + 1;
      this.addresses = [...this.addresses, { ...value, id: nextId }];
      this.toast.success('Address added successfully');
    }
    this.editingAddressId = null;
    this.showForm = false;
    this.addressForm.reset({
      firstName: '',
      lastName: '',
      addressLine1: '',
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

  cancelForm(): void {
    this.showForm = false;
    this.editingAddressId = null;
    this.addressForm.reset({
      firstName: '',
      lastName: '',
      addressLine1: '',
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

  deleteAddress(id: number): void {
    const address = this.addresses.find(a => a.id === id);
    const addressName = address ? `${address.firstName} ${address.lastName}` : 'this address';
    
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${addressName}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.addresses = this.addresses.filter(a => a.id !== id);
        this.toast.success('Address deleted successfully');
      }
    });
  }

  setDefaultAddress(id: number): void {
    this.addresses = this.addresses.map(a => ({ ...a, isDefault: a.id === id }));
    this.toast.success('Default address updated successfully');
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
      firstName: 'First name',
      lastName: 'Last name',
      addressLine1: 'House No / Building name',
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

