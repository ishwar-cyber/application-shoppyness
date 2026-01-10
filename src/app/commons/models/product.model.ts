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
  stock: number
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
  image?: string[];
  images: Image[] | any;
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
  image?: [Image]
  id: number
}

export interface Category {
  id: number
  name: string
  image: Image
  slug?: string
}

export interface Image {
  url?: string
  public_id?: string
}

export interface SubCategory {
  id: number
  name: string
  slug: string
  image: Image2
}


export interface Image2 {
  url: string
  public_id: string
}

export interface Brand {
  id?: number
  name: string
  slug?: string
}

export interface Image3 {
  url: string
  public_id: string
}

export interface Warranty {
  period: number
  type: string
  details: string
  id: number
}

export interface Inventory {
  inStock: boolean
  quantity: number
  reserved: number
  available: number
}
