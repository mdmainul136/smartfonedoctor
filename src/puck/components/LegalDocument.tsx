import type { ReactNode } from "react";
import { BuilderLink as Link } from "../host";

/**
 * A text page in the site's legal-page design (Privacy, Terms, Accessibility):
 * breadcrumb, title, "last updated" line, body, a closing section with a
 * contact card, and footer links. The body is plain rich text (headings,
 * paragraphs, lists, links); the design comes from the styles below, so the
 * page keeps its look however the text is edited. A quote in the body is shown
 * as a grey notice box.
 */
export type LegalDocumentProps = {
  breadcrumbLabel: string;
  title: string;
  updatedLine: string;
  bodyHtml: ReactNode;
  closingHtml: ReactNode;
  contactHtml: ReactNode;
  backLabel: string;
  backHref: string;
  nextLabel: string;
  nextHref: string;
};

const CSS = `
.legal-doc{font-size:13.5px;line-height:1.75;color:#404040;font-weight:400}
@media (min-width:640px){.legal-doc{font-size:14px}}
.legal-doc .rich-text>*+*,.legal-doc>*+*{margin-top:.75rem}
.legal-doc h2{font-size:18px;font-weight:700;color:#1d1c1a;letter-spacing:-.025em;line-height:1.75}
@media (min-width:640px){.legal-doc h2{font-size:20px}}
.legal-doc .rich-text>h2:not(:first-child){margin-top:2rem}
.legal-doc h3{font-size:16px;font-weight:700;color:#1d1c1a}
.legal-doc ul{list-style:disc;padding-left:1.25rem}
.legal-doc ol{list-style:decimal;padding-left:1.25rem}
@media (min-width:640px){.legal-doc ul,.legal-doc ol{padding-left:1.5rem}}
.legal-doc li+li{margin-top:.5rem}
.legal-doc strong{color:#171717;font-weight:600}
.legal-doc a{color:var(--sfd-teal,#00807A);font-weight:600}
.legal-doc a:hover{text-decoration:underline}
.legal-doc blockquote{padding:1.25rem;border-radius:1rem;background:rgb(245 245 245/.9);border:1px solid rgb(229 229 229/.9);color:#171717;font-weight:500;line-height:1.625}
@media (min-width:640px){.legal-doc blockquote{padding:1.5rem}}
.legal-doc blockquote strong{font-size:12px;letter-spacing:.05em;text-transform:uppercase;font-weight:700;color:#262626}
.legal-doc blockquote>*+*{margin-top:.5rem}
.legal-doc section>*+*{margin-top:.75rem}
.legal-card{padding:1.25rem;border-radius:1rem;background:#fff;border:1px solid #e5e5e5;box-shadow:0 1px 2px rgb(0 0 0/.05);color:#525252}
.legal-card .rich-text>*+*{margin-top:.25rem}
.legal-card p:first-child{font-weight:700;color:#1d1c1a}
`;

/** A rich-text prop arrives as HTML in the editor data and as an element when rendered. */
function Rich({ value }: { value: ReactNode }) {
  if (typeof value === "string") return <div className="rich-text" dangerouslySetInnerHTML={{ __html: value }} />;
  return <>{value}</>;
}

function hasContent(value: ReactNode) {
  if (typeof value === "string") return value.replace(/<[^>]*>/g, "").trim().length > 0;
  return Boolean(value);
}

export function LegalDocument(p: LegalDocumentProps) {
  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <nav aria-label="Breadcrumb" className="mb-4 text-[12.5px] text-neutral-500 font-normal">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link href="/" className="hover:text-sfd-teal transition-colors">
              Home
            </Link>
          </li>
          <li className="text-neutral-400">&gt;</li>
          <li className="text-neutral-800 font-medium" aria-current="page">
            {p.breadcrumbLabel || p.title}
          </li>
        </ol>
      </nav>

      <div className="border-b border-neutral-200 pb-6 mb-8">
        <h1 className="text-[28px] sm:text-[38px] lg:text-[44px] font-bold text-[#1d1c1a] tracking-tight leading-tight">
          {p.title}
        </h1>
        {p.updatedLine ? <p className="text-xs sm:text-[13px] text-neutral-500 mt-2">{p.updatedLine}</p> : null}
      </div>

      <div className="legal-doc">
        <Rich value={p.bodyHtml} />
        {hasContent(p.closingHtml) || hasContent(p.contactHtml) ? (
          <section className="pt-4 border-t border-neutral-200" style={{ marginTop: "2rem" }}>
            <Rich value={p.closingHtml} />
            {hasContent(p.contactHtml) ? (
              <div className="legal-card">
                <Rich value={p.contactHtml} />
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      {p.backLabel || p.nextLabel ? (
        <div className="mt-12 pt-6 border-t border-neutral-200 flex items-center justify-between">
          {p.backLabel ? (
            <Link
              href={p.backHref || "/"}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-sfd-teal transition-colors"
            >
              {p.backLabel}
            </Link>
          ) : (
            <span />
          )}
          {p.nextLabel ? (
            <Link href={p.nextHref || "/"} className="text-xs sm:text-sm font-semibold text-sfd-teal hover:underline">
              {p.nextLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
