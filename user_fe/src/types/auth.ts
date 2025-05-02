export type Register =  {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city: string;
  gender: string;
  dateOfBirth: string;
  username: string;
  password: string;
}

export type Login =  {
  username: string;
  password: string;
  otp: number
}