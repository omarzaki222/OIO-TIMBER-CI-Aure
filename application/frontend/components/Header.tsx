"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/auth-context";

const links = [
  { href: "/products", label: "Collection" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-oio-gold/20 bg-oio-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="OIO Wood & Timber home">
          <Image src="/brand/oio-wood-timber-logo.jpg" alt="OIO Wood & Timber" width={56} height={56} className="h-12 w-12 object-contain" />
          <span className="hidden font-serif text-sm tracking-[0.28em] text-oio-ink sm:block">
            OIO WOOD &amp; TIMBER
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.2em] text-oio-ink md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-oio-gold">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/account" className="hover:text-oio-gold">
                Account
              </Link>
              <button type="button" onClick={() => void logout()} className="hover:text-oio-gold">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:text-oio-gold">
              Sign in
            </Link>
          )}
        </nav>
        <button
          type="button"
          className="md:hidden"
          aria-expanded={open}
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-px w-6 bg-oio-ink" />
          <span className="mt-1.5 block h-px w-6 bg-oio-ink" />
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-3 border-t border-oio-gold/20 px-4 py-4 text-sm uppercase tracking-[0.18em] md:hidden" aria-label="Mobile">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href={user ? "/account" : "/login"} onClick={() => setOpen(false)}>
            {user ? "Account" : "Sign in"}
          </Link>
        </nav>
      )}
    </header>
  );
}
