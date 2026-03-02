import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yoygkemmrgwmkapmavwi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveWdrZW1tcmd3bWthcG1hdndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzM5NzUsImV4cCI6MjA4ODA0OTk3NX0.Sxzv5lx9QISF52S5umbE0Rz6hn5eKL3JnGDcTlX_Nws';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
