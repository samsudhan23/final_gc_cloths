export interface Products {
  _id?: string;

  category: string; 
  gender: string;   
  warehouse: string;

  productName: string;
  sku: string;
  productMaterial: string;
  careInstruction?: string;
  productDescription?: string;
  images: string;
  price: number;
  discountPrice?: number;
  gallery: string[];
  brand?: string;

  sizeStock: {
    size: string;
    stock: number;
  }[];

  colors?: string[];
  tags?: string[];

  rating?: {
    average: number;
    count: number;
  };

  totalStock: number;
  inStock: boolean;
  isFeatured: boolean;

  createdAt?: string; // added by Mongoose timestamps
  updatedAt?: string;
}
