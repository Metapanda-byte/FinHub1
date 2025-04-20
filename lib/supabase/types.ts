export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      api_cache: {
        Row: {
          id: string
          ticker: string
          endpoint: string
          data: Json
          timestamp: string
          expires_at: string
        }
        Insert: {
          id?: string
          ticker: string
          endpoint: string
          data: Json
          timestamp?: string
          expires_at: string
        }
        Update: {
          id?: string
          ticker?: string
          endpoint?: string
          data?: Json
          timestamp?: string
          expires_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      watchlists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      watchlist_items: {
        Row: {
          id: string
          watchlist_id: string
          symbol: string
          added_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          watchlist_id: string
          symbol: string
          added_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          watchlist_id?: string
          symbol?: string
          added_at?: string
          notes?: string | null
        }
      }
    }
  }
}