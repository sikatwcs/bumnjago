export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface Profile {
  id: number;
  userId: number;
  name: string;
  province: string;
  phone: string;
  gender: 'male' | 'female';
  instance: string;
} 