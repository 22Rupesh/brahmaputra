
// @ts-nocheck
const { createClient } = globalThis.supabase;

const supabaseUrl = 'https://fibqcpyzurkzhepvffuf.supabase.co';

// WARNING: It is safe to use the ANONYMOUS KEY in a browser when Row Level Security (RLS) is enabled on your tables.
// NEVER expose the SERVICE_ROLE_KEY in client-side code.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpYnFjcHl6dXJremhlcHZmZnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODg1NTEsImV4cCI6MjA3Mjc2NDU1MX0.EVaB5MFd_OfNzvn7p5be70lQLI7sJpMjumCVhlUZQ08';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
