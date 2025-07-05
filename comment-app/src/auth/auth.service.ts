import { Injectable } from '@nestjs/common';
import { supabase } from '../lib/supabase';

@Injectable()
export class AuthService {
  async signUp(email: string, password: string) {
    //console.log('Signing in:', email);
    const { data, error } = await supabase.auth.signUp({ email, password });
    console.log('access token:', data.session?.access_token);
    if (error) throw new Error(error.message);
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('login data:', data);
    if (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message);
    }
    return data;
  }
}
