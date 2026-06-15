export interface Product {
  product_id: number;
  product_name: string;
  product_category: string;
  product_price: number;
  availability: boolean;
  image_url?: string;
}