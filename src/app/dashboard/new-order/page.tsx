"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { NewOrderForm } from "@/components/new-order-form";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

export default function NewOrderPage() {
  const { session, ready } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  useEffect(() => {
    if (ready && (!session || session.role !== "client")) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  if (!ready || !session || session.role !== "client") {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-24">
          <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
            {t("common.loading")}
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-line bg-paper">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
              {t("neworder.eyebrow")}
            </p>
            <h1 className="font-display text-3xl md:text-4xl">{t("neworder.title")}</h1>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-6 py-12">
          <Reveal>
            <NewOrderForm />
          </Reveal>
          <p className="text-sm text-center mt-8">
            <Link href="/dashboard" className="link-underline text-ink-soft hover:text-ink">
              {t("neworder.back")}
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
