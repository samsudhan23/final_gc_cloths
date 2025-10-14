import { Products } from "./product";

export interface CartItem {
    _id?: string; // MongoDB document ID
    userId?: string;        // ObjectId as string
    productId?: Products;     // ObjectId as string (can also be Product type if you populate)
    quantity?: number;
    selectedSize?: string;
    selectedColor?: string;
    addedAt?: string;
    createdAt?: string;    // from timestamps: true
    updatedAt?: string;
}
