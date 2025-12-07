import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MessageModule } from 'primeng/message';
import { UserService } from '../../admin_module/service/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../../pages/service/authentication.service';

interface UserProfileSummary {
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-user-personal-info',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    InputGroupModule,
    InputGroupAddonModule,
    MessageModule
  ],
  templateUrl: './user-personal-info.component.html',
  styleUrl: './user-personal-info.component.scss'
})
export class UserPersonalInfoComponent implements OnInit {
  @Input() user: UserProfileSummary = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    initials: 'JD',
    avatarUrl: 'https://i.pravatar.cc/120?img=5'
  };

  @Output() profileSaved = new EventEmitter<any>();
  @Output() profileImageChanged = new EventEmitter<string>();

  personalForm!: FormGroup;
  isPersonalReadOnly: boolean = true;
  personalSavedSnapshot: any | null = null;
  toastVisible: boolean = false;
  toastMessage: string = '';
  currentUserId: string | null = null;
  isLoading: boolean = false;
  selectedAvatarFile: File | null = null;
  avatarDisplayUrl: string = '';
  
  genderOptions = [
    { label: 'Select Gender', value: '' },
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
  ];
  
  countryOptions = [
    { label: 'India', value: 'India' },
    { label: 'United States', value: 'United States' },
    { label: 'United Kingdom', value: 'United Kingdom' },
    { label: 'Canada', value: 'Canada' },
    { label: 'Australia', value: 'Australia' },
    { label: 'Other', value: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthenticationService,
    private toast: ToastrService
  ) {}

  ngOnInit() {
    // Get current user ID
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && (currentUser._id || currentUser.id)) {
      this.currentUserId = currentUser._id || currentUser.id;
    }

    // Initialize avatar display URL
    this.avatarDisplayUrl = this.user.avatarUrl || 'https://via.placeholder.com/80?text=Avatar';

    this.personalForm = this.fb.group({
      // Personal information
      fullName: [this.user.name || '', [Validators.required, Validators.maxLength(100)]],
      gender: ['', [Validators.required]],
      dob: [null, [Validators.required]],
      profileImage: [''],
      // Address details
      addressLine1: ['', [Validators.maxLength(120)]], // House No / Building name
      streetLocality: ['', [Validators.maxLength(120)]],
      addressLine2: ['', [Validators.maxLength(120)]], // Landmark
      city: ['', [Validators.maxLength(80)]],
      state: ['', [Validators.maxLength(80)]],
      pincode: ['', [Validators.pattern(/^[0-9]{4,10}$/)]],
      country: ['India', [Validators.required]],
      // Contact
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{10,20}$/)]],
      altPhoneNumber: ['', [Validators.pattern(/^[0-9+ ]{10,20}$/)]],
      email: [this.user.email || '', []],
    });

    // Load user data from API
    if (this.currentUserId) {
      this.loadUserProfile();
    }
  }

  loadUserProfile(): void {
    if (!this.currentUserId) return;
    
    this.isLoading = true;
    this.userService.getUserProfile(this.currentUserId).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.result) {
          const userData = res.result;
          // Populate form with user data
          this.personalForm.patchValue({
            fullName: userData.name || '',
            gender: userData.gender || '',
            dob: userData.dateOfBirth ? new Date(userData.dateOfBirth) : null,
            addressLine1: userData.addressLine1 || '',
            streetLocality: userData.streetLocality || '',
            addressLine2: userData.addressLine2 || '',
            city: userData.city || '',
            state: userData.state || '',
            pincode: userData.pincode || '',
            country: userData.country || 'India',
            phoneNumber: userData.phoneNumber || '',
            altPhoneNumber: userData.altPhoneNumber || '',
            email: userData.email || ''
          });

          // Update user object and avatar display
          if (userData.avatar) {
            this.updateAvatarDisplay(userData.avatar);
          } else {
            // Fallback to default avatar
            this.avatarDisplayUrl = 'https://via.placeholder.com/80?text=Avatar';
            this.user = { ...this.user, avatarUrl: this.avatarDisplayUrl };
          }
          if (userData.name) {
            this.user = { ...this.user, name: userData.name };
          }

          // Disable form initially
          this.personalForm.disable();
          this.personalSavedSnapshot = this.personalForm.getRawValue();
        }
      },
      (error: any) => {
        this.isLoading = false;
        this.toast.error('Failed to load user profile');
      }
    );
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedAvatarFile = file;
      
      // Create preview URL for display
      const url = URL.createObjectURL(file);
      this.avatarDisplayUrl = url;
      this.user = { ...this.user, avatarUrl: url };
      this.personalForm.patchValue({ profileImage: file.name });
      this.profileImageChanged.emit(url);
    }
  }

  startEditPersonal(): void {
    this.isPersonalReadOnly = false;
    this.personalForm.enable();
    // Keep email read-only via template attribute
    if (this.personalSavedSnapshot) {
      this.personalForm.patchValue(this.personalSavedSnapshot);
    }
  }

  submitPersonal(): void {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      this.toast.warning('Please fill all required fields correctly');
      return;
    }

    if (!this.currentUserId) {
      this.toast.error('User ID not found');
      return;
    }

    const formValue = this.personalForm.getRawValue();
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add form fields
    formData.append('name', formValue.fullName);
    formData.append('gender', formValue.gender || '');
    if (formValue.dob) {
      // Handle both Date object and string format
      const dobDate = formValue.dob instanceof Date ? formValue.dob : new Date(formValue.dob);
      formData.append('dateOfBirth', dobDate.toISOString());
    }
    formData.append('phoneNumber', formValue.phoneNumber || '');
    formData.append('altPhoneNumber', formValue.altPhoneNumber || '');
    formData.append('email', formValue.email || '');
    formData.append('addressLine1', formValue.addressLine1 || '');
    formData.append('streetLocality', formValue.streetLocality || '');
    formData.append('addressLine2', formValue.addressLine2 || '');
    formData.append('city', formValue.city || '');
    formData.append('state', formValue.state || '');
    formData.append('pincode', formValue.pincode || '');
    formData.append('country', formValue.country || 'India');
    
    // Add avatar file if selected
    if (this.selectedAvatarFile) {
      formData.append('avatar', this.selectedAvatarFile);
    }

    this.isLoading = true;
    this.userService.updateUserProfileWithFile(this.currentUserId, formData).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.code === 200 && res.success === true) {
          this.personalSavedSnapshot = this.personalForm.getRawValue();
          this.personalForm.disable();
          this.isPersonalReadOnly = true;
          this.selectedAvatarFile = null; // Clear selected file after successful upload
          this.showToast('Profile saved successfully');
          this.toast.success(res.message || 'Profile updated successfully');
          
          // Update avatar display from response
          if (res.result?.avatar?.data) {
            this.updateAvatarDisplay(res.result.avatar);
          }
          
          this.profileSaved.emit(res.result);
          
          // Update user object
          this.user = { ...this.user, name: formValue.fullName };
        } else {
          this.toast.error(res.message || 'Failed to update profile');
        }
      },
      (error: any) => {
        this.isLoading = false;
        this.toast.error(error?.error?.message || 'Failed to update profile');
      }
    );
  }

  updateAvatarDisplay(avatar: { data: string; contentType: string }): void {
    if (avatar && avatar.data) {
      // Convert base64 to data URL for display
      this.avatarDisplayUrl = `data:${avatar.contentType};base64,${avatar.data}`;
      this.user = { ...this.user, avatarUrl: this.avatarDisplayUrl };
    }
  }

  resetPersonal(): void {
    this.personalForm.reset({
      fullName: this.user.name || 'John Doe',
      addressLine1: '',
      streetLocality: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      phoneNumber: '',
      altPhoneNumber: '',
      email: this.user.email || ''
    });
    if (this.isPersonalReadOnly && this.personalSavedSnapshot) {
      this.personalForm.patchValue(this.personalSavedSnapshot);
    }
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
    }, 2000);
  }
}
