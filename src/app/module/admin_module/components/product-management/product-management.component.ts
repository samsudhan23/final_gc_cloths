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
import { CategoryService } from '../../service/category/category.service';
import { AdminProductService } from '../../service/productService/admin-product.service';

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
  selector: 'app-product-management',
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
  providers: [CustomerService, ConfirmationService, CategoryService, MessageService, AdminProductService],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.scss'
})
export class ProductManagementComponent {
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
productForm: FormGroup;
  productData: any = [];
  categoryList: any[] = [];
  genderList: any[] = [];
  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private category: CategoryService,
    private product: AdminProductService,
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

    this.productForm = this.fb.group({
      productName: ['batman', Validators.required],
      productDescription: ['asdas', Validators.required],
      gender: [0, [Validators.required]],
      price: ['100', Validators.required],
      discountPrice: [''],
      sizes: ['0', Validators.required],
      stock: ['500', Validators.required],
      tags: ['BATMAN'],
      category: [0, Validators.required],
    });
  }

  ngOnInit() {
    this.loadUsers()
    this.getCategoryList()
    this.productList();
    this.genderData();
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }


  getCategoryList() {
    this.category.getCategoriesMasterList().subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.categoryList = res.result
        console.log('this.categoryList : ', this.categoryList);
      }
    })
  }

  genderData() {
    this.category.getGenderList().subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.genderList = res.result
      }
    })
  }

  productList() {
    this.product.getProductlist().subscribe((res) => {
      if (res.success === true || res.code === 200) {
        this.productData = res.result
        console.log('this.productData: ', this.productData);
      }

    })
  }
  loadUsers(): void {
    this.userService.getUsers().subscribe((res: any) => {
      this.usersList = res.result;
    }, (error: any) => {
      console.log('error: ', error);

    })
  }


  fileInfo: string | number = '';
  imageFile!: File;
  galleryFiles: File[] = [];

  onFileChange(event: Event, type: 'images' | 'gallery') {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      if (type === 'images') {
        this.imageFile = target.files[0]; // single image
        this.fileInfo = this.imageFile.name
      } else if (type === 'gallery') { //Multiple images
        const newFiles = Array.from(target.files)
        this.galleryFiles = [...this.galleryFiles, ...newFiles]
      }
    }
  }

  selectedSizes: any[] = [];

  onSizeChange(event: any): void {
    const sizeId = event.target.value;
    if (event.target.checked) {
      this.selectedSizes.push(sizeId);
    } else {
      this.selectedSizes = this.selectedSizes.filter(id => id !== sizeId);
    }

    // Optional: If you're using reactive form to bind sizes
    this.productForm.get('sizes')?.setValue(this.selectedSizes);
  }

  onSubmit(): void {
    console.log(this.productForm.value);
    const sizes = ['S', 'M', 'L'];
    const formData = new FormData();
    const FormControlValues = this.productForm.value;

    formData.append('productName', FormControlValues.productName);
    formData.append('productDescription', FormControlValues.productDescription);
    formData.append('gender', FormControlValues.gender);
    formData.append('price', FormControlValues.price);
    formData.append('discountPrice', FormControlValues.discountPrice);
    sizes.forEach((val) => {
      formData.append('sizes[]', val)
    })
    // formData.append('sizes', FormControlValues.sizes);
    formData.append('stock', FormControlValues.stock);
    formData.append('tags', FormControlValues.tags);
    formData.append('category', FormControlValues.category);
    if (this.imageFile) {
      formData.append('images', this.imageFile);
    }

    this.galleryFiles.forEach(file => {
      formData.append('gallery', file);
    });
    formData.forEach((value, key) => {
      console.log(key, value);
    })

    this.product.saveProducts(formData).subscribe((res: any) => {
      console.log('res: ', res);
      if (res.code === 200 || res.success === true) {
        this.toast.success(res.message);
        this.productList();
      }
    }, (error) => {
      if (error.error.message) {
        const errMsg = error.error.message;
        if (Array.isArray(errMsg)) {
          // Multiple validation messages
          errMsg.forEach((msg: string) => {
            this.toast.error(msg);
          });
        } else {
          this.toast.error(errMsg);
        }
      }
    })
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  openNew() {
    this.userDialog = true;
    this.mode = 'add'
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


  editUser(event: any, type: string) {
    const editTableDatas = event
    this.userDialog = true;

    switch (type) {
      case "Edit":
        this.mode = 'edit';
        this.currentUserId = editTableDatas._id;
        this.userForm.patchValue(editTableDatas);
        this.userForm.patchValue({
          dateOfBirth: new Date(editTableDatas.dateOfBirth)
        });
        this.userForm.get('password')?.setValue('');
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
