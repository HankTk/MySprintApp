export interface Product
{
  id?: string;
  productCode?: string;
  productName?: string;
  description?: string;
  unitPrice?: number;
  cost?: number;
  unitOfMeasure?: string;
  active?: boolean;
  jsonData?: any;
}

export interface CreateProductRequest
{
  productCode?: string;
  productName?: string;
  description?: string;
  unitPrice?: number;
  cost?: number;
  unitOfMeasure?: string;
  active?: boolean;
  jsonData?: any;
}
