export interface CreateOrder {
  shippingAddressId: number;
  couponCode?: string | null;
  items: CreateOrderItem[];
}

export interface CreateOrderItem {
  productId: number;
  variantId?: number | null;
  quantity: number;
}


export interface ShippingAddress {
  fullName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  id: number
}

export interface Item {
  product: Product
  name: string
  price: number
  discount: number
  quantity: number
  variantId: any
  id: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  images: Image[]
  slug: string
  stock: string
  availableAntivirusStock: number
  id: number
}

export interface Image {
  url: string
  public_id: string
  id: number
}
