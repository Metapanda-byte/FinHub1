"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null as any;

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!supabase) {
      setError('Waitlist temporarily unavailable.');
      return;
    }
    setStatus('loading');
    try {
      const { error } = await supabase.from('waitlist_emails').insert({ email });
      if (error) throw error;
      setStatus('done');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Join the Waitlist</CardTitle>
          <CardDescription>Be the first to know when we launch. We’ll notify you by email.</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'done' ? (
            <div className="text-sm">Thanks! You’re on the list. We’ll be in touch soon.</div>
          ) : (
            <form onSubmit={submit} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" disabled={status==='loading'}>
                {status==='loading' ? 'Submitting…' : 'Sign Up'}
              </Button>
            </form>
          )}
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
} 