import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Prevent crashing if the env vars are missing (useful for local dev without connection)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Realtime Channel Type Defs
export type SyncStatePayload = {
  players: any[];
  roles: any[];
  teams: any[];
  tags: any[];
  isNight: boolean;
};

export type JoinRequestPayload = {
  playerName: string;
};
