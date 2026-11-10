import { createClient } from '@supabase/supabase-js'

/*
 * Run this in your Supabase SQL editor:
 *
 * CREATE TABLE orders (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   created_at TIMESTAMP DEFAULT now(),
 *   customer_name TEXT NOT NULL,
 *   email TEXT,
 *   phone TEXT NOT NULL,
 *   address TEXT NOT NULL,
 *   city TEXT NOT NULL,
 *   pincode TEXT NOT NULL,
 *   landmark TEXT,
 *   notes TEXT,
 *   items JSONB NOT NULL,
 *   total DECIMAL(10,2) NOT NULL,
 *   status TEXT DEFAULT 'pending',
 *   payment_method TEXT DEFAULT 'cod'
 * );
 *
 * CREATE TABLE products (
 *   id INTEGER PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   category TEXT NOT NULL,
 *   price DECIMAL(10,2) NOT NULL,
 *   unit TEXT NOT NULL,
 *   stock INTEGER DEFAULT 0,
 *   image TEXT,
 *   description TEXT,
 *   badge TEXT,
 *   active BOOLEAN DEFAULT true
 * );
 *
 * Enable Row Level Security and add policies as needed.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if real credentials are provided
const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'

// Create a no-op mock client when Supabase is not yet configured
// so the app loads without crashing
function createMockClient() {
  const noOp = async () => ({ data: null, error: null })

  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (_event, _cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured yet. Please add your credentials.' } }),
    signUp: async () => ({ data: null, error: { message: 'Supabase not configured yet. Please add your credentials.' } }),
    resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase not configured yet.' } }),
    updateUser: async () => ({ data: null, error: { message: 'Supabase not configured yet.' } }),
    signOut: noOp,
  }

  const mockQueryBuilder = {
    select: () => mockQueryBuilder,
    insert: () => mockQueryBuilder,
    update: () => mockQueryBuilder,
    delete: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    neq: () => mockQueryBuilder,
    gte: () => mockQueryBuilder,
    lte: () => mockQueryBuilder,
    or: () => mockQueryBuilder,
    range: () => mockQueryBuilder,
    maybeSingle: async () => ({ data: null, error: null }),
    order: () => mockQueryBuilder,
    limit: () => mockQueryBuilder,
    single: async () => ({ data: null, error: null }),
    then: (resolve) => resolve({ data: [], error: null }),
  }

  const mockChannel = { on: () => mockChannel, subscribe: () => mockChannel }

  return {
    auth: mockAuth,
    from: (_table) => mockQueryBuilder,
    rpc: async () => ({ data: [], error: { message: 'Supabase not configured yet.' } }),
    channel: () => mockChannel,
    removeChannel: () => {},
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: 'Supabase not configured yet.' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: async () => ({ data: null, error: null }),
      }),
    },
  }
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      // keep the session (admin + customer) across visits and refresh the token automatically
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : createMockClient()

export const supabaseConfigured = isConfigured
