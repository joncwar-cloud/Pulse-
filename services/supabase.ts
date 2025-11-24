import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmuypfddssxkbdwjdvdc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtdXlwZmRkc3N4a2Jkd2pkdmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Mjg5NzIsImV4cCI6MjA3OTUwNDk3Mn0.HUSNa8KQO8DrFUFvYspV_lqZdOYsilcd_ZYegi7KMuU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
