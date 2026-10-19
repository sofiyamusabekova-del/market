export type Locale = 'ru' | 'en';

export interface Category {
  id: string;
  slug: string;
  name: {
    ru: string;
    en: string;
  };
  iconName: string;
  itemCount: number;
}

export interface ProductAttribute {
  name: {
    ru: string;
    en: string;
  };
  value: {
    ru: string;
    en: string;
  };
}

export interface Product {
  id: string;
  slug: string;
  title: {
    ru: string;
    en: string;
  };
  subtitle?: {
    ru: string;
    en: string;
  };
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  categorySlug: string;
  images: string[];
  inStock: boolean;
  stockCount: number;
  isBestseller?: boolean;
  isNew?: boolean;
  attributes: ProductAttribute[];
  description: {
    ru: string;
    en: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}
