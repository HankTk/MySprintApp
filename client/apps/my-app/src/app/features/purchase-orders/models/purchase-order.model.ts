export interface PurchaseOrderItem {
  id?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
}

export interface PurchaseOrder {
  id?: string;
  orderNumber?: string;
  supplierId?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  status?: string; // "DRAFT", "PENDING_APPROVAL", "APPROVED", "RECEIVED", "INVOICED", "PAID", "CANCELLED"
  invoiceNumber?: string;
  invoiceDate?: string;
  items?: PurchaseOrderItem[];
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  total?: number;
  notes?: string;
  jsonData?: any;
}

export interface CreatePurchaseOrderRequest {
  supplierId?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  status?: string;
  items?: PurchaseOrderItem[];
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  total?: number;
  notes?: string;
  jsonData?: any;
}

