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
import { MultiSelectModule } from 'primeng/multiselect';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
// import { FileUpload } from 'primeng/fileupload';

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
    MultiSelectModule,
    InputGroupModule,
    ReactiveFormsModule,
    // FileUpload,
    InputGroupAddonModule
  ],
  providers: [CustomerService, ConfirmationService, CategoryService, MessageService, AdminProductService],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.scss'
})
export class ProductManagementComponent {
  @ViewChild('dt') dt!: Table;
  formDialog: boolean = false;
  selectedUser!: any | null;
  usersList: any[] = [];
  exportColumns!: ExportColumn[];
  mode: 'add' | 'edit' | 'view' = 'add';
  currentId: string | null = null;
  // cols: Column[] = [
  //   { field: 'Category', header: 'category' },
  //   { field: 'Email', header: 'productName' },
  //   { field: 'Phone', header: 'gender' },
  //   { field: 'Role', header: 'price' },
  //    { field: 'Role', header: 'sizes' },
  //     { field: 'Role', header: 'price' }
  // ];
  dressSizesWithMeasurements = [
    { id: 1, label: 'XS', bust: '30-32', waist: '22-24', hips: '32-34' },
    { id: 2, label: 'S', bust: '32-34', waist: '25-26', hips: '35-36' },
    { id: 3, label: 'M', bust: '35-36', waist: '27-28', hips: '37-38' },
    { id: 4, label: 'L', bust: '37-39', waist: '29-31', hips: '39-41' },
    { id: 5, label: 'XL', bust: '40-42', waist: '32-34', hips: '42-44' },
    { id: 6, label: 'XXL', bust: '43-45', waist: '35-37', hips: '45-47' },
    { id: 7, label: '3XL', bust: '46-48', waist: '38-40', hips: '48-50' }
  ];
  productForm: FormGroup;
  productData: any = [];
  categoryList: any[] = [];
  genderList: any[] = [];
  fileInfo: string | number = '';
  imageFile!: File;
  galleryFiles: File[] = [];

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private category: CategoryService,
    private product: AdminProductService,
    private fb: FormBuilder,
    private toast: ToastrService,
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      productDescription: ['', Validators.required],
      gender: ['', [Validators.required]],
      price: ['', Validators.required],
      discountPrice: [''],
      sizes: [0, Validators.required],
      stock: ['', Validators.required],
      tags: [''],
      category: [0, Validators.required],
    });
  }

  ngOnInit() {
    this.loadUsers()
    this.getCategoryList()
    this.productList();
    this.genderData();
    // this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }


  getCategoryList() {
    this.category.getCategoriesMasterList().subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        this.categoryList = res.result
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

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  openNew() {
    this.formDialog = true;
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
    this.formDialog = false;
    this.productForm.reset();
    this.galleryFiles = []
    this.fileInfo = '';
    this.productForm.get('discountPrice')?.setValue('')
    this.productForm.enable();
  }

  onDialogHide() {  // Reset when dialog is closed using header 'X'
    if (this.productForm) {
      this.productForm.reset();
      this.galleryFiles = []
      this.fileInfo = '';
      this.productForm.get('discountPrice')?.setValue('')
      this.productForm.enable();
    }
  }
  urlToFile(url: string, filename: string): Promise<File> {
    return fetch(url)
      .then(res => res.blob())
      .then(blob => new File([blob], filename, { type: blob.type }));
  }
  async editProducts(event: any, type: string) {
    const editTableDatas = event
    this.formDialog = true;
    switch (type) {
      case "Edit":
        this.mode = 'edit';
        this.currentId = editTableDatas._id;
        console.log('editTableDatas: ', editTableDatas);
        this.productForm.patchValue(editTableDatas);
        this.productForm.patchValue({
          gender: editTableDatas.gender._id,
          category: editTableDatas.category._id
        });
        this.fileInfo = editTableDatas.images;
        this.imageFile = await this.urlToFile(editTableDatas.images, 'oldImage.jpg');
        this.galleryFiles = [await this.urlToFile(editTableDatas.gallery, 'oldImage.jpg')];
        console.log(this.productForm.value);
        this.productForm.enable();
        break;
      case "View":
        this.mode = 'view';
        this.productForm.patchValue(editTableDatas);
        this.productForm.patchValue({
          gender: editTableDatas.gender._id,
          category: editTableDatas.category._id
        });
        this.productForm.disable();
        break;
    }

  }
  onSubmit(): void {
    console.log(this.productForm.value);
    // const sizes = this.productForm.value.sizes;
    const formData = new FormData();
    const FormControlValues = this.productForm.value;

    formData.append('productName', FormControlValues.productName);
    formData.append('productDescription', FormControlValues.productDescription);
    formData.append('gender', FormControlValues.gender);
    formData.append('price', FormControlValues.price);
    if (FormControlValues.discountPrice !== null && FormControlValues.discountPrice !== undefined && FormControlValues.discountPrice !== '') {
      formData.append('discountPrice', FormControlValues.discountPrice.toString());
    } FormControlValues.sizes.forEach((val: any) => {
      formData.append('sizes[]', val)
    })
    console.log(FormControlValues.sizes, 'FormControlValues.sizes');
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
    console.log('formData: ', formData);
    if (this.mode === 'add') {
      this.product.saveProducts(formData).subscribe((res: any) => {
        console.log('res: ', res);
        if (res.code === 200 || res.success === true) {
          this.toast.success(res.message);
          this.productList();
          this.hideDialog();
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
      return;
    }
    else if (this.mode === 'edit' && this.currentId) {
      this.product.updateProducts(formData, this.currentId).subscribe((res: any) => {
        console.log('res: ', res);
        if (res.code === 200 || res.success === true) {
          this.toast.success(res.message);
          this.productList();
          this.hideDialog();
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
  }
}
