import { Component } from '@angular/core';
import { SignInComponent } from '../../../pages/auth/sign-in/sign-in.component';
import { AuthenticationService } from '../../../pages/service/authentication.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DeliveryaddressComponent } from '../deliveryaddress/deliveryaddress.component';
import { UserPersonalInfoComponent } from '../user-personal-info/user-personal-info.component';

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
  addressLine1: string; // House / Building
  addressLine2?: string; // Landmark
  phoneNumber: string;
  altPhoneNumber?: string;
  isDefault?: boolean;
}

@Component({
  selector: 'app-user-profile',
  imports: [SignInComponent, CommonModule, ReactiveFormsModule,ButtonModule, DeliveryaddressComponent, UserPersonalInfoComponent],
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

  addressForm!: FormGroup;
  addresses: Address[] = [];
  editingAddressId: number | null = null;
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

    this.addressForm = this.fb.group({
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

  viewOrder(orderNumber: string): void {
    this.router.navigate(['/user/view-order', orderNumber]);
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

  onProfileImageChanged(avatarUrl: string): void {
    this.user = { ...this.user, avatarUrl };
  }

  openProfileEditor(): void {
    this.setActiveMenu('personal');
  }

  showAddresses(): void {
    this.setActiveMenu('addresses');
  }

  editAddress(address: Address): void {
    this.editingAddressId = address.id;
    this.addressForm.reset({
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

  onPersonalProfileSaved(data: any): void {
    // Handle profile saved event from child component
    this.showToast('Profile saved successfully');
    // Update user data if needed
    if (data?.fullName) {
      this.user = { ...this.user, name: data.fullName };
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


  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
    }, 2000);
  }
}
