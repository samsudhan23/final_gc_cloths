import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserService } from '../../service/user/user.service';
import { AdminProductService } from '../../service/productService/admin-product.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  usersList: any[] = [];
  adminList: any[] = [];
  productData: any = [];

  constructor(
    private userService: UserService,
    private product: AdminProductService,
    private toast: ToastrService,
  ) {

  }

  ngOnInit() {
    this.loadUsers()
    this.productList();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((res: any) => {
      this.usersList = res.result.filter((item: { role: string; }) => item.role === "user");
      this.adminList = res.result.filter((item: { role: string; }) => item.role !== "user");
    }, (error: any) => {
      this.toast.error(error.error.message)
    })
  }

  productList() {
    this.product.getProductlist().subscribe((res) => {
      if (res.success === true || res.code === 200) {
        this.productData = res.result
      }

    })
  }
}
