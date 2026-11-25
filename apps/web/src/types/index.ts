export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPersona: string;
  title: string;
  slug: string;
  description: string;
  category: 'kurtas' | 'kurtis' | 'shirts' | 'sarees' | 'electronics';
  brand: string;
  gender: 'MEN' | 'WOMEN' | 'UNISEX';
  color: string;
  fabric?: string;
  sizes: string[];
  tags: string[];
  price: number; // in Rupees for UI display
  mrp: number;
  stock: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  tryOnSupported: boolean;
  specs?: Record<string, string>;
}

export interface ProductFilters {
  q: string;
  category: string;
  color: string;
  fabric: string;
  gender: string;
  size: string;
  maxPrice: number;
  tryOnOnly: boolean;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating';
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
}

export interface WalletTx {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'GOAL_LOCK' | 'GOAL_UNLOCK' | 'ORDER_DEBIT';
  amount: number;
  note: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  sellerId: string;
  sellerName: string;
  productTitle: string;
  status: 'AI_HANDLING' | 'ESCALATED_TO_SELLER' | 'IN_LIVE_CALL' | 'ESCALATED_TO_PLATFORM' | 'RESOLVED';
  messages: { sender: 'CUSTOMER' | 'SELLER_AI' | 'SELLER_HUMAN' | 'PLATFORM_ADMIN'; text: string; time: string }[];
}