import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.scss'
})
export class ResetpasswordComponent {

  resetForm!: FormGroup;
  token!: string;
  submitted = false;
  message = '';
  error = '';
  loading = false;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private toast: ToastrService,
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    console.log('this.token: ', this.token);
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  get p(): { [key: string]: AbstractControl } {
    return this.resetForm.controls;
  }

  isPasswordVisible: boolean = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  islogPasswordVisible: boolean = false;
  togglelogPasswordVisibility() {
    this.islogPasswordVisible = !this.islogPasswordVisible;
  }

  isconfirmPasswordVisible: boolean = false;

  toggleconfirmPasswordVisibility() {
    this.isconfirmPasswordVisible = !this.isconfirmPasswordVisible;
  }

  onSubmit(){
    this.submitted = true;
    if (this.resetForm.invalid) return;
    const { password, confirmPassword } = this.resetForm.value;
    if (password !== confirmPassword) {
      this.toast.warning("Passwords do not match!");
      return;
    }

    this.http.post(`http://localhost:5000/api/auth/reset-password/${this.token}`, {
    newPassword: password
  }).subscribe({
      next: (res: any) => {
        console.log('res: ', res);
        this.message = res.message;
        this.resetForm.reset();
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        this.error = err.error.message || 'Something went wrong';
      }
    });
  }

  back() {
    this.router.navigate(['/login']);
  }

}
