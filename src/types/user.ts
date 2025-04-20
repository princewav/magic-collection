export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only used internally, not returned to clients
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  image?: string | null;
}
