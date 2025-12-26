export interface Address
{
  id?: string;
  customerId?: string;
  addressType?: string; // "SHIPPING" or "BILLING"
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactName?: string;
  contactPhone?: string;
  defaultAddress?: boolean;
  jsonData?: any;
}

export interface CreateAddressRequest
{
  customerId?: string;
  addressType?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactName?: string;
  contactPhone?: string;
  defaultAddress?: boolean;
  jsonData?: any;
}

