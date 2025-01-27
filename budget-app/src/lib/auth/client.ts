'use client';

import fs from 'fs';
import type { User } from '@/types/user';
import { parseAppSegmentConfig } from 'next/dist/build/segment-config/app/app-segment-config';
import path from 'path';


const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  private usersFilePath = 'data/users.json';

  private readUsers() {
    const data = fs.readFileSync(this.usersFilePath, 'utf-8');
    return JSON.parse(data);
  }

  private writeUsers(users: any) {
    fs.writeFileSync(this.usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  }

  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    // Make API request

    const {email, password} = params;
    const users = this.readUsers();

    // We do not handle the API, so we'll just generate a token and store it in localStorage.
    const userExists = users.some((user: any) => user.email === email);
    if (userExists) {
      return { error: 'User already exists'};
    }

    users.push({email, password});
    this.writeUsers(users);


    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;
    const users = this.readUsers();

    const user = users.find((user: any) => user.email === email && user.password === password);
    if (!user) {
      return { error: 'Invalid email or password' };
    } 

    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.
    const token = localStorage.getItem('custom-auth-token');

    if (!token) {
      return { data: null };
    }

    return { data: user };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');

    return {};
  }
}

function generateToken() {
  return Math.random().toString(36).substring(2);
}

export const authClient = new AuthClient();
