export interface SFC
{
  id?: string;
  sfcNumber?: string;
  rmaId?: string;
  rmaNumber?: string;
  orderId?: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  createdDate?: string;
  startedDate?: string;
  completedDate?: string;
  status?: string; // "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"
  assignedTo?: string;
  notes?: string;
  jsonData?: any;
}

export interface CreateSFCRequest
{
  rmaId?: string;
  rmaNumber?: string;
  orderId?: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  createdDate?: string;
  status?: string;
  assignedTo?: string;
  notes?: string;
  jsonData?: any;
}

