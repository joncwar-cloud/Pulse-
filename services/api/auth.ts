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
    avatar_url?: string;
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
      console.error('[AuthService] Sign up error:', JSON.stringify(authError, null, 2));
      throw new Error(authError.message || 'Sign up failed');
    }
    if (!authData.user) throw new Error('User creation failed');

    console.log('[AuthService] Creating user profile for user:', authData.user.id);
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        username: userData.username,
        display_name: userData.display_name,
        avatar: userData.avatar_url || 'https://api.dicebear.com/7.x/avataaars/png?seed=default',
        date_of_birth: userData.date_of_birth || null,
        interests: userData.interests || [],
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (userError) {
      console.error('[AuthService] Profile creation error:', JSON.stringify(userError, null, 2));
      throw new Error(userError.message || 'Failed to create user profile');
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
      console.error('[AuthService] Sign in error:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Sign in failed');
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
        console.error('[AuthService] Google OAuth error:', JSON.stringify(error, null, 2));
        throw new Error(error.message || 'Google OAuth failed');
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
            
            if (sessionError) {
              console.error('[AuthService] Google session error:', JSON.stringify(sessionError, null, 2));
              throw new Error(sessionError.message || 'Failed to set session');
            }
            
            if (sessionData.user) {
              await this.ensureUserProfile(sessionData.user);
            }
            
            return sessionData;
          }
        }
      }

      return data;
    } catch (error: any) {
      const errorMessage = error?.message || 'Google sign in failed';
      console.error('[AuthService] Google sign in error:', errorMessage, error);
      throw new Error(errorMessage);
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
        console.error('[AuthService] Facebook OAuth error:', JSON.stringify(error, null, 2));
        throw new Error(error.message || 'Facebook OAuth failed');
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
            
            if (sessionError) {
              console.error('[AuthService] Facebook session error:', JSON.stringify(sessionError, null, 2));
              throw new Error(sessionError.message || 'Failed to set session');
            }
            
            if (sessionData.user) {
              await this.ensureUserProfile(sessionData.user);
            }
            
            return sessionData;
          }
        }
      }

      return data;
    } catch (error: any) {
      const errorMessage = error?.message || 'Facebook sign in failed';
      console.error('[AuthService] Facebook sign in error:', errorMessage, error);
      throw new Error(errorMessage);
    }
  },

  async signOut() {
    console.log('[AuthService] Signing out user');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[AuthService] Sign out error:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Sign out failed');
    }
    console.log('[AuthService] Sign out successful');
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[AuthService] Get session error:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Failed to get session');
    }
    return session;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('[AuthService] Get user error:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Failed to get user');
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
      console.error('[AuthService] Get profile error:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Failed to get profile');
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
      console.error('[AuthService] Update profile error:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Failed to update profile');
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
      console.error('[AuthService] Reset password error:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Failed to reset password');
    }
    console.log('[AuthService] Password reset email sent');
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async ensureUserProfile(user: any) {
    console.log('[AuthService] Ensuring user profile exists for:', user.id);
    
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      console.log('[AuthService] User profile already exists');
      return existingProfile;
    }

    console.log('[AuthService] Creating OAuth user profile');
    const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || username;
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/png?seed=${user.id}`;

    const { data: newProfile, error } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        email: user.email,
        username: username,
        display_name: displayName,
        avatar: avatar,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('[AuthService] Failed to create OAuth profile:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Failed to create user profile');
    }

    console.log('[AuthService] OAuth user profile created successfully');
    return newProfile;
  },
};
