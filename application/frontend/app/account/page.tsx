"use client";

import { useAuth } from "@/hooks/auth-context";

export default function AccountPage() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="font-serif text-4xl">Profile</h1>
      <dl className="mt-8 space-y-3 text-sm">
        <div>
          <dt className="uppercase tracking-[0.16em] text-oio-gold">Email</dt>
          <dd>{user?.email}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.16em] text-oio-gold">Name</dt>
          <dd>
            {user?.first_name} {user?.last_name}
          </dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.16em] text-oio-gold">Role</dt>
          <dd>{user?.role}</dd>
        </div>
      </dl>
    </div>
  );
}
