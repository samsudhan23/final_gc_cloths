import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../pages/service/product/product.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-details.component',
  imports: [CommonModule],
  templateUrl: './product-details.component.component.html',
  styleUrl: './product-details.component.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  product: any;
  selectedImage: string = '';
  selectedSize: string | null = null;
  relatedProducts: any[] = [];

  constructor(private router: Router, private toast: ToastrService,) {
    const navigation = this.router.getCurrentNavigation();
    this.product = navigation?.extras?.state?.['product'];
    const allProducts = navigation?.extras?.state?.['allProducts'] || [];

    if (this.product && allProducts.length) {
      this.relatedProducts = allProducts.filter(
        (p: any) => p.category.categoryName === this.product.category.categoryName && p._id !== this.product._id
      );
    }
  }

  ngOnInit() {
    if (this.product) {
      this.selectedImage = this.product.images;
    }
  }

  changeImage(img: any) {
    this.selectedImage = img;
  }

  selectSize(size: any) {
    if (size.stock > 0) {
      this.selectedSize = size.size;
    }
  }

  addToCart(product: any) {
    if (!this.selectedSize) {
      this.toast.warning('Please select a size first!');
      return;
    }
    console.log('Added to cart:', { product, size: this.selectedSize });
  }

  buyNow(product: any) {
    if (!this.selectedSize) {
      this.toast.warning('Please select a size first!');
      return;
    }
    console.log('Buying now:', { product, size: this.selectedSize });
  }

  toggleWishlist(product: any) {
    product.isWishlisted = !product.isWishlisted;
  }

  goToDetails(product: any) {
    // Keep a reference of the current main product
    const previousProduct = this.product;

    // Set the clicked product as the new main product
    this.product = product;
    this.selectedImage = product.images;

    // Rebuild related products list:
    // 1. Remove the clicked product from related list
    // 2. Add the previous product into related list
    // 3. Ensure only products of the same category remain
    this.relatedProducts = this.relatedProducts
      .filter((p) => p._id !== product._id); // remove selected one

    if (previousProduct) {
      this.relatedProducts.push(previousProduct); // put old main into related
    }

    // keep only same-category items
    this.relatedProducts = this.relatedProducts.filter(
      (p) => p.category.categoryName === this.product.category.categoryName && p._id !== this.product._id
    );
  }

  // goToDetails(product: any) {
  //   console.log('product: ', product);
  //   this.router.navigate(['user/product-details'], {
  //     state: { product, allProducts: [...this.relatedProducts, this.product] }
  //   });
  // }

  goBack() {
    this.router.navigate(['user/home']);
  }

}
