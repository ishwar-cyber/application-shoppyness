export interface CreateOrder {
  shippingAddress: ShippingAddress
  paymentMethod: string
  items: Item[]
  totalAmount: number
  couponDiscount: any
}

export interface ShippingAddress {
  fullName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  _id: string
}

export interface Item {
  product: Product
  name: string
  price: number
  discount: number
  quantity: number
  variantId: any
  _id: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  _id: string
  images: Image[]
  slug: string
  stock: string
  availableAntivirusStock: number
  id: string
}

export interface Image {
  url: string
  public_id: string
  _id: string
}
