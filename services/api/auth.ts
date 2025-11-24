import { supabase } from '../supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const authService = {
  async signUp(email: string, password: string, userData: {
    username: string;
    display_name: string;
    date_of_birth?: string;
    interests?: string[];
  }) {
    console.log('[AuthService] Signing up user with email:', email);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: Linking.createURL(''),
      },
    });

    if (authError) {
      console.error('[AuthService] Sign up error:', authError);
      throw authError;
    }
    if (!authData.user) throw new Error('User creation failed');

    console.log('[AuthService] Creating user profile');
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        ...userData,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (userError) {
      console.error('[AuthService] Profile creation error:', userError);
      throw userError;
    }
    
    console.log('[AuthService] User created successfully');
    return { user: authData.user, profile: user };
  },

  async signIn(email: string, password: string) {
    console.log('[AuthService] Signing in user with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('[AuthService] Sign in error:', error);
      throw error;
    }
    console.log('[AuthService] Sign in successful');
    return data;
  },

  async signInWithGoogle() {
    console.log('[AuthService] Initiating Google sign in');
    try {
      const redirectUrl = Linking.createURL('');
      console.log('[AuthService] Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) {
        console.error('[AuthService] Google OAuth error:', error);
        throw error;
      }

      if (Platform.OS !== 'web' && data?.url) {
        console.log('[AuthService] Opening OAuth URL');
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        
        if (result.type === 'success') {
          const url = result.url;
          const params = Linking.parse(url);
          console.log('[AuthService] OAuth success, parsing response');
          
          if (params.queryParams?.access_token) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: params.queryParams.access_token as string,
              refresh_token: params.queryParams.refresh_token as string,
            });
            
            if (sessionError) throw sessionError;
            return sessionData;
          }
        }
      }

      return data;
    } catch (error) {
      console.error('[AuthService] Google sign in error:', error);
      throw error;
    }
  },

  async signInWithFacebook() {
    console.log('[AuthService] Initiating Facebook sign in');
    try {
      const redirectUrl = Linking.createURL('');
      console.log('[AuthService] Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) {
        console.error('[AuthService] Facebook OAuth error:', error);
        throw error;
      }

      if (Platform.OS !== 'web' && data?.url) {
        console.log('[AuthService] Opening OAuth URL');
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        
        if (result.type === 'success') {
          const url = result.url;
          const params = Linking.parse(url);
          console.log('[AuthService] OAuth success, parsing response');
          
          if (params.queryParams?.access_token) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: params.queryParams.access_token as string,
              refresh_token: params.queryParams.refresh_token as string,
            });
            
            if (sessionError) throw sessionError;
            return sessionData;
          }
        }
      }

      return data;
    } catch (error) {
      console.error('[AuthService] Facebook sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    console.log('[AuthService] Signing out user');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[AuthService] Sign out error:', error);
      throw error;
    }
    console.log('[AuthService] Sign out successful');
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[AuthService] Get session error:', error);
      throw error;
    }
    return session;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('[AuthService] Get user error:', error);
      throw error;
    }
    return user;
  },

  async getUserProfile(userId: string) {
    console.log('[AuthService] Fetching user profile for:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[AuthService] Get profile error:', error);
      throw error;
    }
    
    console.log('[AuthService] Profile fetched successfully');
    return data;
  },

  async updateUserProfile(userId: string, updates: any) {
    console.log('[AuthService] Updating user profile:', userId);
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[AuthService] Update profile error:', error);
      throw error;
    }
    
    console.log('[AuthService] Profile updated successfully');
    return data;
  },

  async resetPassword(email: string) {
    console.log('[AuthService] Sending password reset email to:', email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Linking.createURL('reset-password'),
    });
    if (error) {
      console.error('[AuthService] Reset password error:', error);
      throw error;
    }
    console.log('[AuthService] Password reset email sent');
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
