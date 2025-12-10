export interface Warehouse {
  id?: string;
  warehouseCode?: string;
  warehouseName?: string;
  address?: string;
  description?: string;
  active?: boolean;
  jsonData?: any;
}

export interface CreateWarehouseRequest {
  warehouseCode?: string;
  warehouseName?: string;
  address?: string;
  description?: string;
  active?: boolean;
  jsonData?: any;
}

