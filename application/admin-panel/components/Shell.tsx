"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth-context";
import { Mark } from "./Mark";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Units" },
  { href: "/categories", label: "Categories" },
  { href: "/customers", label: "Customers" },
  { href: "/reservations", label: "Reservations" },
  { href: "/inquiries", label: "Inquiries" },
  { href: "/settings", label: "Settings" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-oio-gold/20 bg-oio-sand/40 md:w-56 md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 border-b border-oio-gold/20 px-5 py-5">
          <Mark className="h-9 w-9" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-oio-gold">OIO</p>
            <p className="font-serif text-lg leading-none">Studio</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 p-4 text-xs uppercase tracking-[0.16em] md:flex-col" aria-label="Studio">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2 py-2 ${path.startsWith(item.href) ? "text-oio-gold" : "hover:text-oio-gold"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-oio-gold/20 px-6 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-oio-mute">{user?.email}</p>
          <button
            type="button"
            onClick={() => void logout().then(() => router.push("/login"))}
            className="text-xs uppercase tracking-[0.16em] hover:text-oio-gold"
          >
            Sign out
          </button>
        </header>
        <div className="p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
