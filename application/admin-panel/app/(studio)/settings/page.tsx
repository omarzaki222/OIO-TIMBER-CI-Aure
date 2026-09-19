"use client";

import { useAuth } from "@/hooks/auth-context";
import { API_URL } from "@/lib/config";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1 className="font-serif text-4xl">Settings</h1>
      <dl className="mt-8 max-w-lg space-y-4 text-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">Email</dt>
          <dd>{user?.email}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">Name</dt>
          <dd>
            {user?.first_name} {user?.last_name}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">Role</dt>
          <dd>{user?.role}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">API origin</dt>
          <dd>{API_URL}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-oio-gold">Environment</dt>
          <dd>local development (Phase 4)</dd>
        </div>
      </dl>
      <button type="button" onClick={() => void logout()} className="mt-10 bg-oio-ink px-5 py-2 text-xs uppercase tracking-[0.16em] text-oio-cream">
        Sign out
      </button>
    </div>
  );
}
