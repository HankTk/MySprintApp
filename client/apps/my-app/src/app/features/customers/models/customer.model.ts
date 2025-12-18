export interface Customer {
  id?: string;
  customerNumber?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  addressId?: string;
  jsonData?: any;
}

export interface CreateCustomerRequest {
  customerNumber?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  addressId?: string;
  jsonData?: any;
}

