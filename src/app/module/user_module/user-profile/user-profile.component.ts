import { Component } from '@angular/core';
import { SignInComponent } from '../../../pages/auth/sign-in/sign-in.component';
import { AuthenticationService } from '../../../pages/service/authentication.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface UserProfileSummary {
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
}

type OrderStatus = 'Delivered' | 'Out for delivery' | 'Processing';

interface OrderSummary {
  orderNumber: string;
  shippedDate: Date;
  total: number;
  status: OrderStatus;
  cancellable?: boolean;
}

interface MenuItem {
  key: string;
  label: string;
}

interface Address {
  id: number;
  firstName: string;
  lastName: string;
  addressLine1: string; // House / Building
  addressLine2?: string; // Landmark
  phoneNumber: string;
  altPhoneNumber?: string;
  isDefault?: boolean;
}

@Component({
  selector: 'app-user-profile',
  imports: [SignInComponent, CommonModule, ReactiveFormsModule,ButtonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {
  isLoggedIn: boolean = true;
  user: UserProfileSummary = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    initials: 'JD',
    avatarUrl: 'https://i.pravatar.cc/120?img=5'
  };

  menuItems: MenuItem[] = [
    { key: 'orders', label: 'Orders' },
    { key: 'personal', label: 'My Profile' },
    { key: 'addresses', label: 'Addresses' },
    { key: 'signout', label: 'Sign out' }
  ];

  activeMenu: string = 'orders';

  orders: OrderSummary[] = [
    {
      orderNumber: '7461201',
      shippedDate: new Date(2019, 2, 30),
      total: 78.0,
      status: 'Delivered'
    },
    {
      orderNumber: '7461202',
      shippedDate: new Date(2019, 2, 30),
      total: 118.25,
      status: 'Out for delivery',
      cancellable: true
    },
    {
      orderNumber: '7461203',
      shippedDate: new Date(2019, 2, 30),
      total: 57.49,
      status: 'Processing',
      cancellable: true
    }
  ];

  personalForm!: FormGroup;
  addressForm!: FormGroup;
  addresses: Address[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '221B Baker Street',
      addressLine2: 'Near Central Park',
      phoneNumber: '9876543210',
      altPhoneNumber: '9123456780',
      isDefault: true
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Doe',
      addressLine1: '11 Downing Street',
      phoneNumber: '9000000000'
    }
  ];
  editingAddressId: number | null = null;
  isPersonalReadOnly: boolean = false;
  personalSavedSnapshot: any | null = null;
  toastVisible: boolean = false;
  toastMessage: string = '';

  constructor(private auth: AuthenticationService, private fb: FormBuilder, private router: Router,) {

  }

  ngOnInit() {
    const rolePeremission = this.auth?.getCurrentUser()
    if (rolePeremission?.role === 'user') {
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }

    this.personalForm = this.fb.group({
      // Personal information
      fullName: ['John Doe', [Validators.maxLength(100)]],
      firstName: ['John', [Validators.required, Validators.maxLength(50)]],
      lastName: ['Doe', [Validators.required, Validators.maxLength(50)]],
      gender: ['Male'],
      dob: [''],
      profileImage: [''],
      // Address details
      addressLine1: ['', [Validators.maxLength(120)]], // House No / Building name
      streetLocality: ['', [Validators.maxLength(120)]],
      addressLine2: ['', [Validators.maxLength(120)]], // Landmark
      city: ['', [Validators.maxLength(80)]],
      state: ['', [Validators.maxLength(80)]],
      pincode: ['', [Validators.pattern(/^[0-9]{4,10}$/)]],
      country: ['India'],
      // Contact
      phoneNumber: ['', [Validators.pattern(/^[0-9+ ]{10,20}$/)]],
      altPhoneNumber: ['', [Validators.pattern(/^[0-9+ ]{10,20}$/)]],
      email: [this.user.email, []],
    });

    this.addressForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      addressLine1: ['', [Validators.required, Validators.maxLength(120)]],
      addressLine2: [''],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      altPhoneNumber: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
      isDefault: [false]
    });
  }

  setActiveMenu(menuKey: string): void {
    this.activeMenu = menuKey;
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'Delivered':
        return 'delivered';
      case 'Out for delivery':
        return 'out-for-delivery';
      default:
        return 'processing';
    }
  }

  getActiveMenuLabel(): string {
    const current = this.menuItems.find((m) => m.key === this.activeMenu);
    return current ? current.label : '';
  }

  onAvatarError(): void {
    // If the image fails to load, fallback to initials
    this.user = { ...this.user, avatarUrl: '' };
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];
      const url = URL.createObjectURL(file);
      this.user = { ...this.user, avatarUrl: url };
      this.personalForm.patchValue({ profileImage: file.name });
    }
  }

  openProfileEditor(): void {
    // Prefill personal form with user and default address where possible
    const primary = this.addresses.find(a => a.isDefault) ?? this.addresses[0];
    this.personalForm.patchValue({
      fullName: `${this.user.name}`.trim(),
      firstName: this.user.name.split(' ')[0] || '',
      lastName: this.user.name.split(' ')[1] || '',
      addressLine1: primary?.addressLine1 || '',
      streetLocality: '',
      addressLine2: primary?.addressLine2 || '',
      phoneNumber: primary?.phoneNumber || '',
      altPhoneNumber: primary?.altPhoneNumber || '',
      email: this.user.email
    });
    this.startEditPersonal();
    this.setActiveMenu('personal');
  }

  showAddresses(): void {
    this.setActiveMenu('addresses');
  }

  editAddress(address: Address): void {
    this.editingAddressId = address.id;
    this.addressForm.reset({
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      phoneNumber: address.phoneNumber,
      altPhoneNumber: address.altPhoneNumber || '',
      isDefault: !!address.isDefault
    });
    this.showAddresses();
  }

  addNewAddress(): void {
    this.editingAddressId = null;
    this.addressForm.reset({
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      phoneNumber: '',
      altPhoneNumber: '',
      isDefault: false
    });
    this.showAddresses();
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
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
    } else {
      const nextId = Math.max(0, ...this.addresses.map(a => a.id)) + 1;
      this.addresses = [...this.addresses, { ...value, id: nextId }];
    }
    this.editingAddressId = null;
  }

  deleteAddress(id: number): void {
    this.addresses = this.addresses.filter(a => a.id !== id);
  }

  setDefaultAddress(id: number): void {
    this.addresses = this.addresses.map(a => ({ ...a, isDefault: a.id === id }));
  }

  submitPersonal(): void {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    }
    // Simulate successful save and lock the form
    this.personalSavedSnapshot = this.personalForm.getRawValue();
    this.personalForm.disable();
    this.isPersonalReadOnly = true;
    this.showToast('Profile saved successfully');
  }

  resetPersonal(): void {
    this.personalForm.reset({
      fullName: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '',
      streetLocality: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      phoneNumber: '',
      altPhoneNumber: '',
      email: this.user.email
    });
    if (this.isPersonalReadOnly && this.personalSavedSnapshot) {
      this.personalForm.patchValue(this.personalSavedSnapshot);
    }
  }

  logOut(): void {
    // Clear session and navigate to home, then hard reload the app
    try {
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    } catch { }
    this.router.navigate(['/user/home']).then(() => {
      window.location.reload();
    });
  }

  startEditPersonal(): void {
    this.isPersonalReadOnly = false;
    this.personalForm.enable();
    // Keep email read-only via template attribute
    if (this.personalSavedSnapshot) {
      this.personalForm.patchValue(this.personalSavedSnapshot);
    }
  }

  makePersonalReadOnly(): void {
    this.personalForm.disable();
    this.isPersonalReadOnly = true;
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
    }, 2000);
  }
}
