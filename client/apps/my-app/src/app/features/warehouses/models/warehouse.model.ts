export interface Warehouse
{
  id?: string;
  warehouseCode?: string;
  warehouseName?: string;
  addressId?: string;
  description?: string;
  active?: boolean;
  jsonData?: any;
}

export interface CreateWarehouseRequest
{
  warehouseCode?: string;
  warehouseName?: string;
  addressId?: string;
  description?: string;
  active?: boolean;
  jsonData?: any;
}

