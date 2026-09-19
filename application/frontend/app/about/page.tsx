import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "OIO Wood & Timber — furniture as architecture.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-20 md:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-oio-gold">Studio</p>
      <h1 className="mt-2 font-serif text-5xl">About OIO</h1>
      <p className="mt-8 leading-relaxed text-oio-mute">
        OIO Wood &amp; Timber presents furniture with the discipline of interior architecture. Grain, joinery, and silence. We do not sell carts of inventory — we document units and receive requests from those who wish to live with them.
      </p>
      <p className="mt-6 leading-relaxed">
        The atelier works in wood and timber. Each piece is shown in still rooms. When a unit belongs in your space, you request it. Our team replies as craftspeople, not as a checkout flow.
      </p>
    </article>
  );
}
