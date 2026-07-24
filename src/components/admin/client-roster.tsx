import Link from "next/link";
import type { Client } from "@/lib/mock-data";

export function ClientRoster({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return <p className="text-sm text-ink-soft">No clients yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {clients.map((c) => (
        <Link
          key={c.id}
          href={`/admin/clients/${c.id}`}
          className="group flex items-center justify-between border border-line bg-paper px-5 py-4 transition-colors hover:border-moss-deep"
        >
          <div>
            <p className="font-display text-lg">{c.name}</p>
            <p className="text-xs text-ink-soft">{c.email}</p>
          </div>
          <div className="text-right text-xs text-ink-soft">
            <p>
              {c.orders.length} order{c.orders.length === 1 ? "" : "s"}
            </p>
            <p>
              {c.measurements.updatedAt === "Not yet taken"
                ? "No measurements yet"
                : `Measured ${c.measurements.updatedAt}`}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
