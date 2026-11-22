import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { getSiteOverviewAction, type SiteOverview } from "@/actions/overview";

// Admin home: what is on the website right now, straight from the database.
export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  Published: "bg-[#e6f4ea] text-[#1e6b3a]",
  Draft: "bg-[#f1f3f4] text-[#3c4043]",
  Scheduled: "bg-[#e8f0fe] text-[#1a4fa0]",
  Archived: "bg-[#f1f3f4] text-[#80868b]",
};

function when(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function Stat({ label, value, note, href }: { label: string; value: number; note: string; href: string }) {
  return (
    <Link href={href} className="p-4 flex flex-col justify-between hover:bg-[#fafafa] transition-colors">
      <span className="text-[12px] text-[#5f6368]">{label}</span>
      <span className="mt-1.5 text-[28px] font-semibold text-[#111111] tabular-nums leading-none">{value}</span>
      <span className="text-[12px] text-[#5f6368] mt-1">{note}</span>
    </Link>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-[#e8e8e8] rounded-[8px] flex flex-col min-w-0">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#eaeaea]">
        <h2 className="text-[14px] font-semibold text-[#111111]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-6 text-[13px] text-[#5f6368]">{children}</p>;
}

export default async function AdminOverviewPage() {
  const res = await getSiteOverviewAction();
  if (!res.success || !res.overview) {
    return (
      <div className="flex-1 px-4 sm:px-6 py-5">
        <h1 className="text-[22px] font-semibold text-[#111111]">Overview</h1>
        <p role="alert" className="mt-3 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          Could not load the overview: {res.error ?? "unknown error"}
        </p>
      </div>
    );
  }
  const o: SiteOverview = res.overview;

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-4 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#111111] tracking-[-0.02em] leading-tight">Overview</h1>
          <p className="text-[14px] text-[#5f6368] mt-1">What is on the website right now.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors"
          >
            View site <ExternalLink className="w-3.5 h-3.5 text-[#5f6368]" aria-hidden="true" />
          </Link>
          <Link
            href="/admin/blog/new"
            className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors"
          >
            Write a post
          </Link>
          <Link
            href="/admin/pages"
            className="h-[32px] px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Pages
          </Link>
        </div>
      </div>

      <section
        aria-label="Website at a glance"
        className="bg-white border border-[#e8e8e8] rounded-[8px] grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#eaeaea] overflow-hidden"
      >
        <Stat
          label="Live pages"
          value={o.pages.published}
          note={`${o.pages.drafts} draft${o.pages.drafts === 1 ? "" : "s"} · ${o.pages.scheduled} scheduled`}
          href="/admin/pages"
        />
        <Stat label="Blog posts" value={o.posts.published} note={`${o.posts.drafts} in draft`} href="/admin/blog" />
        <Stat label="Open leads" value={o.leads.open} note={`${o.leads.total} in total`} href="/admin/leads" />
        <Stat label="Active redirects" value={o.redirects} note="Old URLs sent to new ones" href="/admin/seo" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel
          title="Recently edited"
          action={
            <Link href="/admin/pages" className="text-[12px] text-[#5f6368] hover:text-[#111111]">
              All pages
            </Link>
          }
        >
          {o.recentEdits.length === 0 ? (
            <Empty>No pages yet.</Empty>
          ) : (
            <ul className="divide-y divide-[#f2f2f2]">
              {o.recentEdits.map((p) => (
                <li key={p.slug} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/pages/${p.slug}`} className="text-[13px] font-medium text-[#111111] hover:underline truncate block">
                      {p.name}
                    </Link>
                    <span className="text-[12px] text-[#5f6368]">
                      {p.category === "Template" || p.category === "Global" ? p.category : p.path} · {when(p.updatedAt)} · {p.author}
                    </span>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[p.status] ?? STATUS_STYLE.Draft}`}>
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Needs attention"
          action={<span className="text-[12px] text-[#5f6368] tabular-nums">{o.attention.length}</span>}
        >
          {o.attention.length === 0 ? (
            <Empty>Nothing to fix: every live page has a title and meta description of the right length.</Empty>
          ) : (
            <ul className="divide-y divide-[#f2f2f2]">
              {o.attention.slice(0, 8).map((a, i) => (
                <li key={i} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <span className="text-[13px] text-[#111111] min-w-0">
                    <span className="text-[11px] font-medium text-[#5f6368] mr-2">{a.kind}</span>
                    {a.label}
                  </span>
                  <Link href={a.href} className="shrink-0 text-[12px] font-medium text-[#1a4fa0] hover:underline">
                    Fix
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Latest leads"
          action={
            <Link href="/admin/leads" className="text-[12px] text-[#5f6368] hover:text-[#111111]">
              All leads
            </Link>
          }
        >
          {o.recentLeads.length === 0 ? (
            <Empty>No leads yet. Booking requests from the website show up here.</Empty>
          ) : (
            <ul className="divide-y divide-[#f2f2f2]">
              {o.recentLeads.map((l) => (
                <li key={l.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[13px] font-medium text-[#111111] block truncate">
                      {l.device} · {l.issue}
                    </span>
                    <span className="text-[12px] text-[#5f6368] capitalize">
                      {l.source} · {when(l.createdAt)}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#f1f3f4] px-2 py-0.5 text-[11px] font-medium text-[#3c4043] capitalize">
                    {l.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Scheduled to go live">
          {o.scheduled.length === 0 ? (
            <Empty>Nothing scheduled. Set a page to Scheduled in Pages to publish it at a set time.</Empty>
          ) : (
            <ul className="divide-y divide-[#f2f2f2]">
              {o.scheduled.map((p) => (
                <li key={p.slug} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <Link href={`/admin/pages/${p.slug}`} className="text-[13px] font-medium text-[#111111] hover:underline truncate">
                    {p.name}
                  </Link>
                  <span className="shrink-0 text-[12px] text-[#5f6368] tabular-nums">{when(p.scheduledAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
