"use client";

export function ConfirmBar({
  open,
  title,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-oio-ink/40 p-4">
      <div className="w-full max-w-md border border-oio-gold/30 bg-oio-cream p-6">
        <p className="font-serif text-2xl">{title}</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onConfirm} className="bg-oio-ink px-4 py-2 text-xs uppercase tracking-[0.16em] text-oio-cream">
            Confirm
          </button>
          <button type="button" onClick={onCancel} className="border border-oio-gold/40 px-4 py-2 text-xs uppercase tracking-[0.16em]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
