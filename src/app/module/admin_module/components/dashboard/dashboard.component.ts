import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserService } from '../../service/user/user.service';
import { AdminProductService } from '../../service/productService/admin-product.service';
import { ToastrService } from 'ngx-toastr';
import { ChartModule } from 'primeng/chart';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TableModule ,ChartModule, BadgeModule, CardModule, TimelineModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  usersList: any[] = [];
  adminList: any[] = [];
  productData: any = [];

  overviewCards: any[] = [];
  salesData: any;
  bestSellers: any[] = [];
  recentOrders: any[] = [];

  constructor(
    private userService: UserService,
    private product: AdminProductService,
    private toast: ToastrService,
  ) {

  }

  ngOnInit() {
    this.loadUsers()
    this.productList();

    this.overviewCards = [
      { title: 'Total Orders', value: 1450 },
      { title: 'Revenue', value: '$24,500' },
      { title: 'Products', value: 280 },
      { title: 'Out of Stock', value: 7 }
    ];

    this.salesData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Sales',
          data: [400, 600, 750, 900, 850, 950],
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4
        }
      ]
    };

    this.bestSellers = [
      { name: 'Classic Blue Shirt', sales: 210 },
      { name: 'Slim Fit Jeans', sales: 180 },
      { name: 'Graphic T-Shirt', sales: 160 },
      { name: 'Denim Jeans', sales: 120 },
      { name: 'Plain White T-Shirt', sales: 100 }
    ];

    this.recentOrders = [
      { id: 'ORD1001', customer: 'John Doe', product: 'Classic Blue Shirt', status: 'Delivered', date: '2025-06-16' },
      { id: 'ORD1002', customer: 'Jane Smith', product: 'Slim Fit Jeans', status: 'Processing', date: '2025-06-15' },
      { id: 'ORD1003', customer: 'Alice Brown', product: 'Graphic T-Shirt', status: 'Shipped', date: '2025-06-15' },
      { id: 'ORD1004', customer: 'Bob Johnson', product: 'Denim Jeans', status: 'Delivered', date: '2025-06-14' },
      { id: 'ORD1005', customer: 'Emma Wilson', product: 'Plain White T-Shirt', status: 'Cancelled', date: '2025-06-13' }
    ];

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
