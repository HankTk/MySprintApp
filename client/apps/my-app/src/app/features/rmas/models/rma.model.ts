export interface RMAItem {
  id?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  quantity?: number;
  returnedQuantity?: number;
  unitPrice?: number;
  lineTotal?: number;
  reason?: string;
  condition?: string;
}

export interface RMA {
  id?: string;
  rmaNumber?: string;
  orderId?: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  rmaDate?: string;
  receivedDate?: string;
  status?: string; // "DRAFT", "PENDING_APPROVAL", "APPROVED", "RECEIVED", "PROCESSED", "CANCELLED"
  items?: RMAItem[];
  subtotal?: number;
  tax?: number;
  restockingFee?: number;
  total?: number;
  notes?: string;
  jsonData?: any;
}

export interface CreateRMARequest {
  orderId?: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  rmaDate?: string;
  status?: string;
  items?: RMAItem[];
  subtotal?: number;
  tax?: number;
  restockingFee?: number;
  total?: number;
  notes?: string;
  jsonData?: any;
}

