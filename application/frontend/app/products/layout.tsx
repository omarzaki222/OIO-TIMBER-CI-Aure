import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collection",
  description: "OIO Wood & Timber furniture units.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
