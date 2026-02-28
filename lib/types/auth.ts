export enum UserRole {
  admin = "admin",
  viewer = "viewer",
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  role: UserRole
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface GoogleAuthInput {
  idToken: string
}
