export type GLEntryType = 'REVENUE' | 'COST' | 'PAYMENT' | 'EXPENSE' | 'ACCOUNTS_PAYABLE';

export interface GLEntry {
  id: string;
  date: string;
  type: GLEntryType;
  orderId?: string;
  orderNumber?: string;
  poId?: string;
  poNumber?: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;
  description: string;
  quantity: number;
  amount: number;
  cost?: number;
  status: string;
  debitAmount?: number;
  creditAmount?: number;
}

