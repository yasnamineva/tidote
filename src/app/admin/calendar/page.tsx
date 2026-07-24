"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { Reveal } from "@/components/reveal";
import { AdminAvailabilityPanel } from "@/components/calendar/admin-availability-panel";
import { useAuth } from "@/lib/auth";

export default function AdminCalendarPage() {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && (!session || session.role !== "admin")) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  if (!ready || !session || session.role !== "admin") {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-24">
          <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
            Loading&hellip;
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <AdminNav />
      <main className="flex-1">
        <section className="border-b border-line bg-paper">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
              Studio Admin
            </p>
            <h1 className="font-display text-3xl md:text-4xl">Fitting Calendar</h1>
            <p className="text-sm text-ink-soft mt-3 max-w-xl">
              Open or close days, add fitting slots, and see order due-dates and
              booked fittings at a glance.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <Reveal>
            <AdminAvailabilityPanel />
          </Reveal>
          <p className="text-sm text-center mt-10">
            <Link href="/admin" className="link-underline text-ink-soft hover:text-ink">
              &larr; Back to Overview
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
