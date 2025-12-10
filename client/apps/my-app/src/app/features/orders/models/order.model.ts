export interface OrderItem {
  id?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
}

export interface Order {
  id?: string;
  orderNumber?: string;
  customerId?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  orderDate?: string;
  shipDate?: string;
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SHIPPING_INSTRUCTED' | 'SHIPPED' | 'INVOICED' | 'PAID' | 'CANCELLED' | 'PENDING';
  invoiceNumber?: string;
  invoiceDate?: string;
  items?: OrderItem[];
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  total?: number;
  notes?: string;
  jsonData?: any;
}

export interface CreateOrderRequest {
  customerId?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  orderDate?: string;
  shipDate?: string;
  status?: string;
  items?: OrderItem[];
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  total?: number;
  notes?: string;
  jsonData?: any;
}

