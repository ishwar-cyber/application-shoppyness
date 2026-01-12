
// ------------------- Models -------------------
export interface CartResponse {
  message: string;
  success: boolean;
  data: CartData;
}

export interface CartData {
  visitorId: string;
  items: Item[];
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  subTotal: number;
  shippingCharge: number;
  discount: number;
  totalPrice: number;
  total: number;
  id: number;
}

export interface Item {
  id: number;
  product: Product;
  slug: string;
  name: string;
  images:Image[],
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  name: string;
  images: Image[];
  discount: number;
  slug: string;
  price: number;
  category: string[];
  pincode: string[];
  stock: number;
  description: string;
  sku: string;
  featured: boolean;
  bestSeller: boolean;
  tag: any[];
  rating: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  subCategory: string;
  brand: string;
  status: boolean;
  warranty: Warranty[];
  variants: any[];
  specifications: any[];
  offerPrice: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: number;
}

export interface Image {
  url: string;
  public_id: string;
  id: number;
}

export interface Warranty {
  period: number;
  type: string;
  details: string;
  id: number;
}