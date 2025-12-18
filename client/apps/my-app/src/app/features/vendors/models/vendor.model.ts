export interface Vendor {
  id?: string;
  vendorNumber?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  addressId?: string;
  jsonData?: any;
}

export interface CreateVendorRequest {
  vendorNumber?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  addressId?: string;
  jsonData?: any;
}

