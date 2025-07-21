import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ilotcwtcnlihoprxcdzp.supabase.co'

// IMPORTANT: Use the ANON key for frontend, not the secret key!
// Get this from: Supabase Dashboard > Settings > API > anon/public key
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3Rjd3RjbmxpaG9wcnhjZHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2OTQzNzIsImV4cCI6MjA1MDI3MDM3Mn0.YourCorrectAnonKeyHere'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)