export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: any;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  category: 'Spices' | 'Nuts' | 'Blends';
  stockQuantity: number;
  threshold: number;
  unit: string;
  tier: 'Basic' | 'Standard' | 'Premium';
}

export interface CartItem extends Product {
  quantity: number;
  isCustom?: boolean;
  blendIngredients?: { productId: string; name: string; quantity: number }[];
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: any;
  email: string;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}
