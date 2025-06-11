import { Component, ViewChild } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { CategoryService } from '../../service/category/category.service';
import { AdminProductService } from '../../service/productService/admin-product.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SplitPipe } from '../../../../shared/core/pipes/split.pipe';
import { PopupComponent } from '../../../../shared/components/popup/popup.component';


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
    InputGroupAddonModule,
    SplitPipe,
    PopupComponent
  ],
  providers: [CustomerService, ConfirmationService, CategoryService, MessageService, AdminProductService],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.scss'
})
export class ProductManagementComponent {
  @ViewChild('dt') dt!: Table;
  formDialog: boolean = false;
  selectedUser!: any | null;
  mode: 'add' | 'edit' | 'view' = 'add';
  currentId: string | null = null;
  showFileName: boolean = false;
  dressSizesWithMeasurements = [
    { id: 1, label: 'XS', bust: '30-32', waist: '22-24', hips: '32-34' },
    { id: 2, label: 'S', bust: '32-34', waist: '25-26', hips: '35-36' },
    { id: 3, label: 'M', bust: '35-36', waist: '27-28', hips: '37-38' },
    { id: 4, label: 'L', bust: '37-39', waist: '29-31', hips: '39-41' },
    { id: 5, label: 'XL', bust: '40-42', waist: '32-34', hips: '42-44' },
    { id: 6, label: 'XXL', bust: '43-45', waist: '35-37', hips: '45-47' },
    { id: 7, label: '3XL', bust: '46-48', waist: '38-40', hips: '48-50' }
  ];
  productForm!: FormGroup;
  productData: any = [];
  categoryList: any[] = [];
  genderList: any[] = [];
  fileInfo: string | number = '';
  imageFile!: File;
  galleryFiles: any[] = [];
  galleryImages: any;
  singleImage: any;
  addImage: any;
  selectedSizes: any[] = [];

  constructor(
    private confirmationService: ConfirmationService,
    private category: CategoryService,
    private product: AdminProductService,
    private fb: FormBuilder,
    private toast: ToastrService,
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      productDescription: [''],
      gender: ['', [Validators.required]],
      price: ['', Validators.required],
      discountPrice: [''],
      sizes: ['', Validators.required],
      sizeStock: this.fb.array([]),
      totalStock: ['', Validators.required],
      tags: [''],
      category: ['', Validators.required],
    });
  }
  get sizeStockControls(): FormArray {
    return this.productForm.get('sizeStock') as FormArray;
  }
  ngOnInit() {
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
      }

    })
  }
  onFileChange(event: Event, type: 'images' | 'gallery') {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      if (type === 'images') {
        this.imageFile = target.files[0]; // single image
        this.fileInfo = this.imageFile.name
        this.singleImage = this.fileInfo
        this.addImage = this.imageFile
        this.showFileName = true;
      } else if (type === 'gallery') { //Multiple images
        const newFiles = Array.from(target.files)
        this.galleryFiles = [...this.galleryFiles, ...newFiles]
        this.galleryImages = this.galleryFiles
        this.showFileName = true;
      }
    }
  }

  // onSizeChange(event: any): void {
  //   this.selectedSizes = event.value;
  //   const sizeStockArray: FormArray = this.fb.array([]);
  //   this.selectedSizes.forEach(size => {
  //     sizeStockArray.push(this.fb.group({
  //       size: [size],
  //       stock: [0, [Validators.required, Validators.min(0)]]
  //     }));
  //   });
  //   this.productForm.setControl('sizeStock', sizeStockArray);

  // }
  onSizeChange(event: any): void {
    this.selectedSizes = event.value;
    const currentArray = this.productForm.get('sizeStock') as FormArray;

    // 1. Preserve existing values
    const existingControls = currentArray.controls;
    const existingSizeMap = new Map<string, number>();

    existingControls.forEach(control => {
      const size = control.get('size')?.value;
      const stock = control.get('stock')?.value;
      existingSizeMap.set(size, stock);
    });

    // 2. Rebuild FormArray with preserved values
    const updatedArray: FormArray = this.fb.array([]);

    this.selectedSizes.forEach(size => {
      updatedArray.push(this.fb.group({
        size: [size],
        stock: [
          existingSizeMap.has(size) ? existingSizeMap.get(size) : 0,
          [Validators.required, Validators.min(0)]
        ]
      }));
    });

    this.productForm.setControl('sizeStock', updatedArray);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  openNew() {
    this.formDialog = true;
    this.mode = 'add'
  }

  // Calculate Total Stock
  calculateTotalStock(stock: any) {
    const sizeStockArray = this.productForm.get('sizeStock')?.value || [];
    const total = sizeStockArray.reduce((acc: number, curr: any) => {
      const stock = Number(curr.stock) || 0;
      return acc + stock;
    }, 0);
    this.productForm.get('totalStock')?.setValue(total);
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected Products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const dele = {
          ids: this.selectedUser.map((ite: { _id: any; }) => ite._id)
        }
        this.product.deleteProducts(dele).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.productList()
          }
        });
      }
    });
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  deleteProduct(data: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + data.productName + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const dele = {
          ids: data._id
        }
        this.product.deleteProducts(dele).subscribe((res: any) => {
          if (res.code === 200 && res.success === true) {
            this.toast.success(res.message);
            this.productList()
          }
        });
      }
    });
  }

  hideDialog() {
    this.formDialog = false;
    this.productForm.reset();
    this.galleryFiles = []
    this.galleryImages = []
    this.singleImage = '';
    this.addImage = '';
    this.fileInfo = '';
    this.productForm.get('discountPrice')?.setValue('')
    this.productForm.get('price')?.setValue('')
    this.productForm.get('tags')?.setValue('')
    this.productForm.get('productDescription')?.setValue('')
    this.productForm.enable();
    this.showFileName = false
    this.sizeStockControls.clear();
  }

  onDialogHide() {  // Reset when dialog is closed using header 'X'
    if (this.productForm) {
      this.productForm.reset();
      this.galleryFiles = []
      this.galleryImages = [];
      this.singleImage = '';
      this.addImage = '';
      this.fileInfo = '';
      this.productForm.get('discountPrice')?.setValue('')
      this.productForm.get('price')?.setValue('')
      this.productForm.get('tags')?.setValue('')
      this.productForm.get('productDescription')?.setValue('')
      this.productForm.enable();
      this.showFileName = false
      this.sizeStockControls.clear();
    }
  }
  async editProducts(event: any, type: string) {
    const editTableDatas = event;
    this.formDialog = true;

    if (type === 'Edit') {
      this.mode = 'edit';
      this.currentId = editTableDatas._id;
      this.productForm.patchValue({
        ...editTableDatas,
        gender: editTableDatas.gender._id,
        category: editTableDatas.category._id,
      });

      const sizesArray = editTableDatas.sizeStock?.map((s: any) => s.size) || [];
      this.productForm.get('sizes')?.setValue(sizesArray);
      const sizeStockArray = this.productForm.get('sizeStock') as FormArray;
      sizeStockArray.clear(); // Clear existing controls
      sizesArray.forEach((size: string) => {
        const stockObj = editTableDatas.sizeStock.find((item: any) => item.size === size);
        const stockValue = stockObj ? stockObj.stock : 0;
        sizeStockArray.push(this.fb.group({
          size: [size],
          stock: [stockValue, [Validators.required, Validators.min(0)]]
        }));
      });
      this.fileInfo = editTableDatas.images;
      this.singleImage = this.fileInfo;
      this.galleryFiles = [...this.galleryFiles, ...editTableDatas.gallery];
      this.galleryImages = this.galleryFiles;
      this.productForm.enable();
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
    }
    if (this.productForm.valid) {
      const formData = new FormData();
      const FormControlValues = this.productForm.value;

      formData.append('productName', FormControlValues.productName);
      formData.append('productDescription', FormControlValues.productDescription);
      formData.append('gender', FormControlValues.gender);
      formData.append('price', FormControlValues.price);
      if (FormControlValues.discountPrice !== null && FormControlValues.discountPrice !== undefined && FormControlValues.discountPrice !== '') {
        formData.append('discountPrice', FormControlValues.discountPrice.toString());
      }
      //  FormControlValues.sizes.forEach((val: any) => {
      //   formData.append('sizes[]', val)
      // })
      FormControlValues.sizeStock.forEach((size: any, index: number) => {
        formData.append(`sizeStock[${index}][size]`, size.size.toString());
        formData.append(`sizeStock[${index}][stock]`, size.stock);
      });

      formData.append('totalStock', FormControlValues.totalStock);
      formData.append('tags', FormControlValues.tags);
      formData.append('category', FormControlValues.category);
      if (this.imageFile) {
        formData.append('images', this.imageFile);
      }
      this.galleryFiles.forEach(file => {
        if (file instanceof File) {
          // New file: upload the actual file
          formData.append('gallery', file);
        } else if (typeof file === 'string') {
          // Existing image URL: extract filename
          let tmp = file.split('http://localhost:5000/assets/Products/')[1];
          formData.append('existingGallery', tmp);
        }
      });
      if (this.mode === 'add') {
        this.product.saveProducts(formData).subscribe((res: any) => {
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

}
