import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private products: any[] = []; // Replace with API later

  setProducts(data: any[]) {
    this.products = data;
  }

  getProductById(id: string) {
    return this.products.find(p => p._id === id);
  }
}
