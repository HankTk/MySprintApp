export interface User
{
  id: string;
  userid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  jsonData: any;
}

export interface CreateUserRequest
{
  userid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  jsonData: any;
}
