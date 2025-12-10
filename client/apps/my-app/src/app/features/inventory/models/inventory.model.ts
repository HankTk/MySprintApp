export interface Inventory {
  id?: string;
  productId?: string;
  warehouseId?: string;
  quantity?: number;
  jsonData?: any;
}

export interface CreateInventoryRequest {
  productId?: string;
  warehouseId?: string;
  quantity?: number;
  jsonData?: any;
}

