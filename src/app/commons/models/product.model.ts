export interface ResponsePayload{
    message: string,
    data: ProductModel,
    success: boolean
}
export interface ProductModel {
  id: string
  name: string
  discount: number
  slug?: string
  price: number
  variants: Variant[]
  category: Category[]
  pincode: string[]
  stock: string
  description: string
  sku: string
  featured: boolean
  bestSeller: boolean
  tag?: any[]
  rating?: number
  weight?: number
  length?: number
  width?: number
  height?: number
  subCategory?: SubCategory
  brand?: Brand
  status?: boolean
  warranty?: Warranty[],
  image?: string;
  images?: string[];
  productImages?: any[];
  specifications: string[]
  offerPrice: any[]
  createdAt: string
  updatedAt: string
  inventory: Inventory
}

export interface Variant {
  name:string
  sku: string
  price: number
  stock: number
  image?: string
  _id: string
}

export interface Category {
  _id: string
  name: string
  image: Image
  slug?: string
}

export interface Image {
  url: string
  public_id: string
}

export interface SubCategory {
  _id: string
  name: string
  slug: string
  image: Image2
}


export interface Image2 {
  url: string
  public_id: string
}

export interface Brand {
  _id: string
  name: string
  slug: string
  image: Image3
}

export interface Image3 {
  url: string
  public_id: string
}

export interface Warranty {
  period: number
  type: string
  details: string
  _id: string
}

export interface Inventory {
  inStock: boolean
  quantity: number
  reserved: number
  available: number
}
