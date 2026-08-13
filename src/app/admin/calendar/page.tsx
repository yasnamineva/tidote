"use client";

import { AdminTopBar } from "@/components/admin/admin-shell";
import { Reveal } from "@/components/reveal";
import { AdminAvailabilityPanel } from "@/components/calendar/admin-availability-panel";
import { useLang } from "@/lib/i18n";

export default function AdminCalendarPage() {
  const { t } = useLang();

  return (
    <>
      <AdminTopBar title={t("cal.title")} />
      <p className="text-sm text-ink-soft mb-8 -mt-4 max-w-xl">{t("cal.sub")}</p>
      <Reveal>
        <AdminAvailabilityPanel />
      </Reveal>
    </>
  );
}
