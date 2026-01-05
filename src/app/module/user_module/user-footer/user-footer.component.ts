import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../admin_module/service/category/category.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-footer',
  imports: [CommonModule,RouterModule],
  templateUrl: './user-footer.component.html',
  styleUrl: './user-footer.component.scss'
})
export class UserFooterComponent {
  categoryList: any[] = [];

  ngOnInit() {
    this.getCategoryList();
  }
  constructor(private router: Router,
    private category: CategoryService,
  ) { }

  getCategoryList() {
    this.category.getCategoriesMasterList().subscribe((res: any) => {
      if (res.code === 200 && res.success === true) {
        // this.categoryList = res.result;
        const categories = res.result || [];
        // Prepend the 'All' option
        this.categoryList = categories;
      }
    });
  }
  contactus() {
    this.router.navigate(['user/contactus']);
  }

  aboutus() {
    this.router.navigate(['user/about']);
  }

  categoryproductlists(item: any) {
    console.log('item: ', item);
    this.router.navigate(['user/productlists', item.categoryName]);
  }

  productlists() {
    this.router.navigate(['user/productlists']);
  }

  privacypolicy() {
    this.router.navigate(['user/privacypolicy']);
  }

  termscondition() {
    this.router.navigate(['user/termsconditions']);
  }

  returnpolicy() {
    this.router.navigate(['user/returnpolicy']);
  }

  refundpolicy() {
    this.router.navigate(['user/refundpolicy']);
  }

}
