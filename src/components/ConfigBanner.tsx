import React from 'react';
import { AlertTriangle, Database, ArrowRight } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const ConfigBanner: React.FC = () => {
  if (isSupabaseConfigured) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-300/40 text-amber-900 px-4 py-2.5 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-semibold text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Demonstration Mode (Unconnected Database)
          </span>
          <span className="hidden md:inline text-amber-700">
            • Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> to connect real PostgreSQL storage.
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-amber-800">
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL Migrations Ready in <code>supabase/migrations/</code></span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};
