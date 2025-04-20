import { useEffect, useState } from 'react';
import { supabase } from './client';
import type { Database } from './types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Watchlist = Database['public']['Tables']['watchlists']['Row'];
type WatchlistItem = Database['public']['Tables']['watchlist_items']['Row'];

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setProfile(null);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return { profile, loading, error };
}

export function useWatchlists() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchWatchlists() {
      try {
        const { data, error } = await supabase
          .from('watchlists')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWatchlists(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchWatchlists();
  }, []);

  return { watchlists, loading, error };
}

export function useWatchlistItems(watchlistId: string) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const { data, error } = await supabase
          .from('watchlist_items')
          .select('*')
          .eq('watchlist_id', watchlistId)
          .order('added_at', { ascending: false });

        if (error) throw error;
        setItems(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    if (watchlistId) {
      fetchItems();
    }
  }, [watchlistId]);

  return { items, loading, error };
}