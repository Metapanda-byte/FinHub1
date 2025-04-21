import { supabase } from '@/lib/supabase/client';

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function fetchWithCache(endpoint: string): Promise<any> {
  // Check cache first
  const { data: cachedData } = await supabase
    .from('api_cache')
    .select('*')
    .eq('endpoint', endpoint)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (cachedData) {
    return cachedData.data;
  }

  // If not in cache, fetch from API
  const response = await fetch(`https://financialmodelingprep.com/api/v3/${endpoint}?apikey=${process.env.NEXT_PUBLIC_FMP_API_KEY}`);
  const data = await response.json();

  // Store in cache
  await supabase
    .from('api_cache')
    .upsert({
      endpoint,
      data,
      expires_at: new Date(Date.now() + CACHE_DURATION).toISOString()
    });

  return data;
} 