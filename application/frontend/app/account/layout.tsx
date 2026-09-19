import Link from "next/link";
import { AccountGuard } from "@/components/AccountGuard";

const items = [
  { href: "/account", label: "Profile" },
  { href: "/account/reservations", label: "Reservations" },
  { href: "/account/saved", label: "Saved" },
  { href: "/account/inquiries", label: "Inquiries" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountGuard>
      <div className="mx-auto max-w-6xl px-4 py-12 md:flex md:gap-12 md:px-6">
        <aside className="mb-8 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] md:mb-0 md:w-48 md:flex-col">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="hover:text-oio-gold">
              {i.label}
            </Link>
          ))}
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AccountGuard>
  );
}
