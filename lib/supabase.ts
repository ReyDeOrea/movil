import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hrojphcqktmijvagyrha.supabase.co";
const supabasePublishableKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyb2pwaGNxa3RtaWp2YWd5cmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTk3MDQsImV4cCI6MjA3ODM3NTcwNH0.zrkU7-7tmfixk2XLTVyYJjfKZg9uF9FeV-_O5dO8720";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})