export interface User
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jsonData: any;
}

export interface CreateUserRequest
{
  firstName: string;
  lastName: string;
  email: string;
  jsonData: any;
}
