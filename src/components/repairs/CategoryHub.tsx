"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Clock, Wrench, Smartphone, MapPin, Layers, Hammer, Tag } from "lucide-react";
import { STORES } from "@/lib/stores";
import type { PSeoDevice, PSeoIssue } from "@/lib/pSeoEngine";
import { useRouteData } from "@/components/site/RouteDataContext";
import { HUB_DEFAULTS, type CategoryHubProps, type HubCategory } from "./categoryHubContent";

/** What a category hub page shows: its category and that category's catalog entries. */
export type CategoryRouteData = {
  category: HubCategory;
  devices: PSeoDevice[];
  repairs: PSeoIssue[];
};

type TabKey = "devices" | "brands" | "repairs";
type Card = { id: string; title: string; subtitle: string; image: string; href: string };

// next/image can only resize images from these hosts (next.config.mjs) or local files.
const OPTIMIZED_HOSTS = ["images.unsplash.com", "plus.unsplash.com", "images.pexels.com"];
const canOptimize = (src: string) => {
  if (src.startsWith("/")) return true;
  try {
    return OPTIMIZED_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
};
const pick = (v: string | undefined, d: string) => (v && v.trim() ? v : d);

/**
 * CPR-style category hub (/repairs/<category>). Device, brand and repair lists
 * come from the repair catalog (Admin > Device Models, Repair Types); the text
 * can be edited per category in the page builder.
 */
export function CategoryHub(props: CategoryHubProps) {
  const data = useRouteData<CategoryRouteData>("repair-category");
  const [tab, setTab] = useState<TabKey>("devices");

  const tabs = useMemo(() => {
    if (!data) return [];
    const devices = [...data.devices].sort((a, b) => b.releaseYear - a.releaseYear);
    const deviceCards: Card[] = devices.map((d) => ({
      id: d.slug,
      title: d.name,
      subtitle: d.specs.split("·")[0]?.trim() || d.brand,
      image: d.image,
      href: `/repairs/${d.category}/${d.slug}`,
    }));
    const brandCards: Card[] = [];
    for (const d of devices) {
      if (brandCards.some((b) => b.id === d.brandSlug)) continue;
      const models = devices.filter((x) => x.brandSlug === d.brandSlug);
      brandCards.push({
        id: d.brandSlug,
        title: `${d.brand} Repair`,
        subtitle: models.map((m) => m.name).join(", "),
        image: d.image,
        href: `/repairs/${d.category}/${d.slug}`,
      });
    }
    const flagship = devices[0];
    const repairCards: Card[] = flagship
      ? data.repairs.map((r) => ({
          id: r.slug,
          title: r.name,
          subtitle: `From $${r.basePrice} · ${r.turnaroundDisplay}`,
          image: flagship.image,
          href: `/repairs/${r.category}/${flagship.slug}/${r.slug}`,
        }))
      : [];
    return [
      { key: "devices" as TabKey, label: "Devices", icon: Layers, items: deviceCards },
      { key: "brands" as TabKey, label: "Brands", icon: Tag, items: brandCards },
      { key: "repairs" as TabKey, label: "Common Repairs", icon: Hammer, items: repairCards },
    ].filter((t) => t.items.length > 0);
  }, [data]);

  if (!data) {
    return (
      <div className="mx-auto my-10 max-w-xl rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
        The category hub appears here, with this category&apos;s devices and repairs.
      </div>
    );
  }

  const d = HUB_DEFAULTS[data.category];
  const badge = pick(props.badge, d.badge);
  const heroTitle = pick(props.heroTitle, d.heroTitle);
  const heroIntro = pick(props.heroIntro, d.heroIntro);
  const heroImage = pick(props.heroImage, d.heroImage);
  const selectionHeading = pick(props.selectionHeading, d.selectionHeading);
  const platforms = props.platforms?.length ? props.platforms : d.platforms;
  const warrantyText = pick(props.warrantyText, d.warrantyText);
  const storeHeading = pick(props.storeHeading, d.storeHeading);
  const storeIntro = pick(props.storeIntro, d.storeIntro);
  const active = tabs.find((t) => t.key === tab) ?? tabs[0];
  const noun = d.name.replace(/ Repair$/, "").toLowerCase();

  const storePoints = [
    { icon: Clock, text: "Same-day repair on most screens and batteries" },
    { icon: Wrench, text: "WISE-certified technicians at every bench" },
    { icon: Smartphone, text: "Phones, tablets, computers and game consoles" },
    { icon: MapPin, text: `${STORES.length} locations across West Philly & University City` },
  ];

  return (
    <div className="bg-[#FAF8F5] text-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-neutral-600">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="underline underline-offset-2 hover:text-[#111827]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              <Link href="/repairs" className="underline underline-offset-2 hover:text-[#111827]">
                Repairs
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li aria-current="page" className="text-[#111827]">
              {d.name}
            </li>
          </ol>
        </nav>

        <section className="relative overflow-hidden rounded-2xl bg-[#111827] min-h-[420px] sm:min-h-[480px] flex items-end sm:items-center">
          <Image
            src={heroImage}
            alt={heroTitle}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            unoptimized={!canOptimize(heroImage)}
            className="object-cover object-right opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/85 to-[#111827]/10" />
          <div className="relative z-10 w-full max-w-2xl p-6 sm:p-12 text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-3 py-1 text-[13px]">
              <Wrench className="w-3.5 h-3.5" />
              {badge}
            </span>
            <h1 className="mt-5 text-3xl sm:text-5xl font-semibold leading-[1.1]">{heroTitle}</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-300">{heroIntro}</p>
          </div>
        </section>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Link
            href={`/schedule-repair?device=${encodeURIComponent(d.name.replace(/ Repair$/, ""))}`}
            className="inline-flex items-center justify-center rounded-md bg-sfd-teal px-6 py-3 text-sm font-semibold text-white hover:bg-sfd-tealDark transition-colors"
          >
            Book Repair
          </Link>
          <Link
            href="/repair-status"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#D6CDB8] bg-white px-5 py-3 text-sm text-[#374151] hover:border-[#111827] transition-colors"
          >
            Already have a repair with us?
            <span className="font-semibold text-[#111827] underline underline-offset-2">Check status</span>
          </Link>
        </div>

        {active && (
          <section className="mt-16 sm:mt-24" aria-labelledby="selection-heading">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <h2 id="selection-heading" className="max-w-xl text-3xl sm:text-4xl font-semibold leading-tight">
                {selectionHeading}
              </h2>
              <div role="tablist" aria-label={`Browse ${noun} repairs`} className="flex flex-wrap gap-2">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const selected = t.key === active.key;
                  return (
                    <button
                      key={t.key}
                      role="tab"
                      type="button"
                      aria-selected={selected}
                      aria-controls="selection-panel"
                      onClick={() => setTab(t.key)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                        selected
                          ? "border-[#111827] bg-[#111827] text-white"
                          : "border-[#D6CDB8] bg-white text-[#374151] hover:border-[#111827]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div id="selection-panel" role="tabpanel" className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {active.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-xl border border-[#E5DEC9] bg-white p-4 hover:border-[#111827] transition-colors"
                >
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-[#F3EDE4]">
                    <Image src={item.image} alt="" fill sizes="64px" unoptimized={!canOptimize(item.image)} className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold leading-snug">{item.title}</h3>
                    <p className="mt-0.5 text-[13px] text-neutral-600 line-clamp-1">{item.subtitle}</p>
                    <span className="mt-2 inline-flex items-center gap-0.5 text-[13px] font-semibold text-[#111827] group-hover:text-sfd-teal">
                      Learn more <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {platforms.length > 0 && (
          <section className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6" aria-label={`${d.name} by platform`}>
            {platforms.map((p) => (
              <article key={p.title} className="flex flex-col rounded-xl bg-[#F3EDE4] p-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#E5DEC9]">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    unoptimized={!canOptimize(p.image)}
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-neutral-700">{p.body}</p>
                <Link href={p.href} className="mt-4 inline-flex items-center gap-0.5 text-sm font-semibold text-[#111827] hover:text-sfd-teal">
                  Book {p.title.replace(" Repair", "")} repair <ChevronRight className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </section>
        )}

        <section className="mt-16 sm:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="relative min-h-[260px] overflow-hidden rounded-xl bg-[#E5DEC9]">
            <Image
              src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1000&auto=format&fit=crop&q=80"
              alt="Technician checking a repaired device"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-[#E5DEC9] bg-white p-6 sm:p-10">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#D6CDB8] px-3 py-1 text-[13px] text-[#374151]">
              <ShieldCheck className="w-3.5 h-3.5" />
              90-Day Warranty
            </span>
            <h2 className="mt-4 text-3xl font-semibold">We stand behind every repair</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">{warrantyText}</p>
            <Link
              href="/warranty"
              className="mt-6 inline-flex w-fit items-center rounded-md border border-[#111827] px-5 py-2.5 text-sm font-semibold hover:bg-[#111827] hover:text-white transition-colors"
            >
              Learn more about our warranty
            </Link>
          </div>
        </section>

        <section className="mt-16 sm:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-2xl bg-[#F3EDE4] p-6 sm:p-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">{storeHeading}</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">{storeIntro}</p>
            <ul className="mt-6 space-y-3">
              {storePoints.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[15px]">
                  <Icon className="w-5 h-5 shrink-0 text-sfd-teal" />
                  {text}
                </li>
              ))}
            </ul>
            <Link
              href="/locations/i/book-repair"
              className="mt-8 inline-flex items-center justify-center rounded-md bg-sfd-teal px-6 py-3 text-sm font-semibold text-white hover:bg-sfd-tealDark transition-colors"
            >
              Find my store
            </Link>
          </div>
          <ul className="space-y-3 self-center">
            {STORES.map((s) => (
              <li key={s.id} className="rounded-xl border border-[#E5DEC9] bg-white p-5">
                <p className="text-[13px] text-neutral-600">{s.type}</p>
                <p className="mt-0.5 font-semibold">{s.address}</p>
                <p className="text-[14px] text-neutral-700">{s.cityStateZip}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                  <span className="text-neutral-600">{s.businessHours}</span>
                  <a href={s.gmbUrl} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2 hover:text-sfd-teal">
                    Directions
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
