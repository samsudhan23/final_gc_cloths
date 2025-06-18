import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../service/authentication.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, ButtonModule, ButtonGroupModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  loading:boolean = false;
  isLogin: boolean = true;
  signupForm: FormGroup;
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  otpForm: FormGroup;
  isOtpVerification: boolean = false;
  receivedOtp: any;
  showOtpScreen = false;
  userRegisteredData: any;
  showPassword = false;
  isForgotPassword: boolean = false;
  resendAvailable = false;
  resendCountdown = 20;
  private timerSubscription: Subscription | null = null;
  @ViewChildren('otp1, otp2, otp3, otp4, otp5, otp6') otpInputs!: QueryList<ElementRef>;

  constructor(private fb: FormBuilder, private router: Router, private toast: ToastrService, private http: HttpClient, private auth: AuthenticationService) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      dob: ['', Validators.required],
    });
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.forgotPasswordForm = this.fb.group({
      femail: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      otp1: ['', [Validators.required,]], //Validators.pattern('[0-9]')
      otp2: ['', [Validators.required,]],
      otp3: ['', [Validators.required,]],
      otp4: ['', [Validators.required,]],
      otp5: ['', [Validators.required,]],
      otp6: ['', [Validators.required,]],
      // otp: ['', [Validators.required, Validators.pattern(/^[0-9]{4}$/)]]
    });
    this.startResendTimer();

    // localStorage.removeItem('users');
  }

  preventCopyPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  get s(): { [key: string]: AbstractControl } {
    return this.signupForm.controls;
  }

  get l(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  get p(): { [key: string]: AbstractControl } {
    return this.forgotPasswordForm.controls;
  }
  get o(): { [key: string]: AbstractControl } {
    return this.otpForm.controls;
  }

  toggleForm(isLogin: boolean) {
    this.isLogin = isLogin;
    this.isForgotPassword = false;
    this.showOtpScreen = false;
  }

  isPasswordVisible: boolean = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  islogPasswordVisible: boolean = false;
  togglelogPasswordVisibility() {
    this.islogPasswordVisible = !this.islogPasswordVisible;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      const formData = {
        name: this.signupForm.value.name,
        phoneNumber: this.signupForm.value.phoneNumber,
        email: this.signupForm.value.email,
        dateOfBirth: this.signupForm.value.dob,
        password: this.signupForm.value.password
      };
      // Call register API
      this.http.post<any>('http://localhost:5000/api/auth/register', formData).subscribe({
        next: (res) => {
          const { email, phoneNumber } = formData;
          // Call send OTP API
          this.http.post<any>('http://localhost:5000/api/auth/send-otp', { email, phoneNumber }).subscribe({
            next: () => {
              this.toast.success('OTP sent to your email!');
              this.showOtpScreen = true;
              this.startResendTimer();
              this.loading = false;
            },
            error: (err) => {
              this.toast.error('Failed to send OTP');
              this.loading = false;
              console.error('Send OTP Error:', err);
            }
          });
        },
        error: (err) => {
          this.toast.error('Registration failed');
          console.error('Register Error:', err);
           this.loading = false;
        }
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
  autoFocusNext(event: any, index: number) {
    const value = event.target.value;
    if (value.length === 1 && index < 6) {
      const nextInput = this.otpInputs.get(index);
      if (nextInput) nextInput.nativeElement.focus();
    }
  }

  onSubmitOtp() {
    if (this.otpForm.valid) {
      const otp = Object.values(this.otpForm.value).join('');
      const payload = {
        name: this.signupForm.value.name,
        phoneNumber: this.signupForm.value.phoneNumber,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        dateOfBirth: this.signupForm.value.dob,
        otp: otp
      };

      this.http.post<any>('http://localhost:5000/api/auth/verify-otp', payload).subscribe({
        next: (res) => {
          this.toast.success('Registration Successful!');
          this.showOtpScreen = false;
          this.toggleForm(true); // shows login form
          this.loginForm.get('email')?.setValue(this.signupForm.value.email);
          this.loginForm.get('password')?.setValue(this.signupForm.value.password);
          this.signupForm.reset();
          this.otpForm.reset();
        },
        error: (err) => {
          this.toast.error('OTP verification failed');
          console.error('Verify OTP Error:', err);
        }
      });

    } else {
      this.otpForm.markAllAsTouched();
    }
  }


  resendOtp() {
    this.receivedOtp = '123456'; // Or generate a new one
    this.toast.info('OTP resent successfully!');
    this.startResendTimer();
  }

  onSubmitLogin() {
    if (this.loginForm.valid) {
      const payload = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.auth.login(payload).subscribe((res) => {
        if (res.success === true || res.code === 200) {
          console.log('res: ', res.result);
          this.toast.success(res.message);
          const role = res.result.role;

          // Redirect based on role
          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (role === 'user') {
            this.router.navigate(['/user']);
          }
          // this.loginForm.reset();
          this.islogPasswordVisible = false;
          // this.router.navigateByUrl('');
        }
      }, (error: any) => {
        this.toast.error(error.error.message)
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  // Handle forgot password form submission
  onSubmitForgotPassword() {
    if (this.forgotPasswordForm.valid) {
      this.loading = true
      const payload = { email: this.forgotPasswordForm.value.femail };

      this.http.post<any>('http://localhost:5000/api/auth/forgot-password', payload)
        .subscribe({
          next: (res) => {
            this.toast.success(res.message || 'Reset link sent to your Mail ID!');
            this.forgotPasswordForm.reset();
            this.isLogin = true;           // show login view
            this.isForgotPassword = false; // hide forgot‑password view
            this.loading = false
          },
          error: (err) => {
            const msg =
              err.status === 404
                ? 'No account found for that email!'
                : 'Something went wrong, please try again.';
            this.toast.error(msg);
            console.error('Forgot‑Password Error:', err);
          }
        });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  // Show the forgot password form
  showForgotPasswordForm() {
    this.isLogin = false;
    this.isForgotPassword = true;
  }

  // Show the login form again
  backToLogin() {
    this.isLogin = true;
    this.isForgotPassword = false;
  }


  startResendTimer() {
    this.resendAvailable = false;
    this.resendCountdown = 20;

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    const timer = interval(1000);
    this.timerSubscription = timer.subscribe((count) => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0 && this.timerSubscription) {
        this.resendAvailable = true;
        this.timerSubscription.unsubscribe();
      }
    });
  }

}
