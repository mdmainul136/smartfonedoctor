# SmartFoneDoctor CMS Plan

Goal: every public page can be edited in the Puck editor at `/admin/pages/[slug]`. The Prisma/Postgres
database is the only source of truth, and the editor works better than WordPress
(draft/publish, preview, revisions, media, SEO, templates). The current architecture stays:
Next.js + Puck (`@puckeditor/core`) + Prisma.

Status key: [ ] todo, [~] in progress, [x] done

---

## Audit findings (2026-11-22)

| # | Problem | Where | Impact |
|---|---------|-------|--------|
| A1 | The editor loads a page from **localStorage/code seed**, not from the DB | `admin/pages/[slug]/page.tsx` (`getStoredCMSPages`) | Editing on another browser shows stale content, and publishing can overwrite newer DB content |
| A2 | Public pages read **localStorage** when no `initialPage` is passed | `CMSSectionRenderer`, `CustomPage` | Visitors see an old cached copy (the "Lifetime" bug), and DB edits never reach them |
| A3 | 9 site pages render `CMSSectionRenderer` without server data | faq, privacy, terms, accessibility, supply-chain, repair-status, repairs, review, warranty | Admin edits to these pages never show |
| A4 | Publish errors are swallowed (`.catch(console.error)`) and the success toast always shows | editor `handleSave`/`handlePuckPublish` | The admin thinks it's live when it isn't |
| A5 | The CMS server actions (`upsert`/`delete`/`duplicate`) have **no auth check** | `src/actions/cmsPages.ts` | Anyone can POST a server action and change pages. **Security** |
| A6 | Drafts/revisions/autosave are stored in localStorage; the DB tables `page_builder_drafts`/`revisions` are unused by the editor | `src/puck/storage/localStorage.ts` | No real history and no cross-device drafts |
| A7 | Home Puck content is ignored unless `custom=true` | `CMSSectionRenderer` line ~252 | Editing Home in the builder does nothing |
| A8 | Dead DB pages: `/repairs/iphone`, `/ipad`, `/mac`, `/computer`, `/smartphone`, `/locations` are code redirects or code pages | `cms_pages` | Confusing for the admin, since edits go nowhere |
| A9 | No DB rows for privacy, terms, accessibility, supply-chain, warranty | `cms_pages` | Not listed in admin, so not editable |
| A10 | `compiledCss` is empty on every row | DB | Style-engine output isn't persisted (it's computed at publish only) |
| A11 | Two CMSes: Payload tables plus Puck | `next.config.mjs withPayload` | Bundle weight and confusion |

---

## Phase 1: DB is the single source of truth (foundation): DONE 2026-11-22
Notes:
- Client routes (`/repair-status`, `/supply-chain`) get their CMS row from a server `layout.tsx` via `CmsPageProvider` (`src/components/site/CmsPageContext.tsx`).
- Unpublished pages in the catch-all route are served to signed-in admins only.
- Editor success/error notices float above the full-screen builder.
- Verified: About badge text edited in the builder → published → seen in the server HTML of `/about` → reverted.
- [x] 1.1 Add a `requireAdmin()` guard (session cookie → DB check) to every mutating CMS action
- [x] 1.2 Add `getCmsPageForEditorAction(slug)` and make the editor load the page from the DB (seed only if the row is missing)
- [x] 1.3 Editor save/publish: await the result, show a real error toast on failure, and update state from the returned row
- [x] 1.4 Pages list: load from the DB only, with no localStorage cache as truth
- [x] 1.5 `CMSSectionRenderer` / `CustomPage`: stop reading localStorage for visitors. Server data only, with `?preview=true` for admins
- [x] 1.6 Server-load `initialPage` (`getCmsPage`) in all 9 site pages from A3
- [x] 1.7 Script `scripts/cms-ensure-pages.mjs`: create missing DB rows (privacy, terms, accessibility, supply-chain, warranty) with no puckData, so the code design shows until someone builds it in Puck
- [x] 1.8 Verify: edit About in the builder → publish → the public page shows the change in a clean browser

## Phase 2: Draft, preview, revisions (WordPress parity): DONE 2026-11-22
Notes:
- Server actions in `src/actions/pageBuilder.ts` (all admin-only, via `src/lib/adminGuard.ts`); the adapter is `src/plugins/repair-shop/dbBuilderStorage.ts`.
- Saved templates now live in `page_builder_templates`. The 4 seeded presets use block types that no longer exist (HeroModern, ServicesGrid, FeatureGrid, CallToActionBanner), so they are hidden. Rebuild them in 4.3.
- Old drafts, revisions and templates kept in a browser's localStorage are not migrated.
- Verified on About: edit → draft row in DB → `/preview/about` shows it, live `/about` does not → reload offers "Restore draft" → publish adds a revision with author → History lists it.
- [x] 2.1 Autosave drafts to `page_builder_drafts` (server action, debounced), with a "Restore draft" banner
- [x] 2.2 Publish writes a `page_builder_revisions` snapshot (label, author, block count)
- [x] 2.3 History panel lists DB revisions → preview → restore
- [x] 2.4 Preview: `/preview/<slug>` ("Preview draft" in the builder) renders the autosaved draft for a signed-in admin only, noindex
- [x] 2.5 Status workflow: Draft / Published / Scheduled (done 2026-11-22)
  - New status `Scheduled` + "Goes live at" (Admin > Pages > Settings). Saving Scheduled needs a future time. Due pages are promoted to Published on the next page or list request (`promoteDueScheduledPages()` in `src/actions/cmsPages.ts`, at most every 15 s); no cron needed. Publishing in the builder keeps a future schedule.
  - Verified: test page 404 before its time, then Published and 200 on its own; test page deleted.

## Phase 3: Page-by-page pass: DONE 2026-11-22 (except the owner decisions below)
Tools: `scripts/cms-content-audit.mjs` (read-only check for phone, brand, warranty, color, broken links and images), `scripts/cms-fix-content-2026-11.mjs` (applied), `scripts/cms-sync-seo-from-live.mjs` (applied).

Done:
- Old colors (#009691, #c8102e) in builder data → #00807A on every page. About's meta description no longer says "lifetime". The audit now shows 0 issues.
- Archived rows whose URLs are code redirects: /repairs/iphone, /ipad, /mac, /computer, /smartphone, /locations. New status `Archived`: never shown to visitors, sorted last in the admin.
- The admin list and the editor header say when visitors do NOT see the builder layout (`builderLayoutStatus` in `src/lib/cmsData.ts`).
- Visitors only ever get the builder layout of a Published page (the renderer ignores Draft and Archived).
- The SEO panel now controls title, description, canonical, OG image and keywords on faq, privacy, terms, accessibility, repairs, review, warranty, supply-chain and repair-status (`src/lib/cmsMetadata.ts`). The DB was first synced to the live values, so nothing changed for Google. Tested on Privacy.
- The FAQ page's FAQPage schema is built from the questions actually shown (it listed 4 questions that weren't on the page).

| Page | Path | Visitors see | Status |
|------|------|--------------|--------|
| Home | `/` | Builder layout made of 9 "Site Section" blocks (the coded sections) | Switched 2026-11-22 at the owner's request; same design as before, now reorderable/removable in the builder |
| About, FAQ, Repairs hub, Reviews, Repair status | | Builder layout | Editable; checked live |
| Warranty, Privacy, Terms, Accessibility, Supply chain | | Built-in design (no layout yet) | SEO editable; content edits need the page rebuilt as blocks (4.7) |
| Schedule repair | `/schedule-repair` | Built-in booking wizard | Kept coded on purpose (conversion page) |
| Device hubs, Locations | | Redirects | Archived |

Owner decisions still open:
- Warranty "not covered" list: confirm the wording.

### Home switch (2026-11-22)
- New generic block **Site Section** (`SiteSectionBlock` in `src/puck/config.tsx`) renders any coded section the app registers via `setBuilderHost({ widgets: { sections } })`. Home's sections are registered in `src/plugins/repair-shop/siteSections.tsx` and load on demand (`next/dynamic`, still server-rendered).
- `scripts/cms-home-to-sections.mjs` replaced the old generic home layout (kept as a History revision, "Old builder home…", plus a JSON backup).
- Home FAQ schema is emitted only for FAQs actually on the page (the Home FAQ section and/or FAQ blocks).
- Removed the `custom` gate: Home now behaves like every other page. "Reset" restores the 9-section layout.
- Every home section's text, links and photos are editable (4.9). LCP was not re-measured on a production build.

## Phase 4: Editor UX better than WordPress
- [x] 4.1 Media library in the DB (done 2026-11-22)
  - The list lives in `taxonomy_store` row `media-library` (seeded from the old manifest + built-in images); browser localStorage and the base64 fallback are gone. Alt text and caption are saved (PATCH).
  - **Security:** `/api/admin/media` had no login check and accepted any file (stored XSS risk via HTML/SVG). Now admin-only; JPEG/PNG/WebP/GIF/AVIF only, 10 MB max, extension from the MIME type; delete by id, only files under `/uploads/`. `/api/admin/puck-ai` POST is admin-only too.
  - Verified: anonymous → 401, HTML upload → 400, upload/alt edit/delete work.
- [x] 4.2 Live SEO check in the SEO panel (done 2026-11-22): `LivePageSeoCheck.tsx` loads the real page (or `/preview/<slug>` when unpublished) and scores 10 checks out of 100: title length, meta description, canonical, indexable, one H1, word count, image alt, internal links, structured data, focus keyword. About: 80/100.
- [x] 4.3 Global blocks: edited once, shown everywhere they are inserted (done 2026-11-22)
  - A global block is a `cms_pages` row with category `Global` (slug `global-<name>`, never a URL, not in the sitemap). Create/list in **Admin > Theme Builder > Global blocks** (shows where each is used); edit it in the normal builder.
  - Insert anywhere with the new "Global block" widget (pick from a list). The site layout loads published global blocks once (`src/lib/globalBlocks.ts`) and `GlobalBlockView` renders them with the slim renderer; nesting is capped. Publishing one refreshes the whole site.
  - Verified: block inserted on /faq → shown; its text changed → /faq changed; Theme Builder showed "used on /faq"; `/_global/...` 404; test data removed.
- [x] 4.4 Widget Design CSS in the server HTML, once (done 2026-11-22)
  - Found: every styled widget already writes its own `<style>` next to it (`src/puck/style/styleRender.tsx`), in the server HTML, on every route (incl. global blocks and pages that never had page CSS). The page-level `compiledCss` was a **second copy** of the same rules (tested on About: rule twice). It's no longer emitted (home, about, catch-all, blog, hubs, device/repair/common-issue templates, preview) or computed on publish; `pickLayout` returns only the page. Today no published page uses the Design panel, so output is unchanged.
- [x] 4.5 Page list bulk actions (done 2026-11-22): checkboxes (incl. "select all shown") → Publish / Move to draft, saved one by one through the normal save (same checks, cache refresh). Verified on 2 test pages: 404 → 200 → 404; deleted after.
- [x] 4.6 Roles: Admin vs Editor (done 2026-11-22)
  - `src/lib/roles.ts`: `super_admin` and `admin` publish; `manager` and `technician` are editors. Server-side (`requirePublisher()` in `adminGuard.ts`): editors can save **Draft** pages and builder drafts only. They can't publish, schedule, unpublish, change a live page, template or global block, delete pages, create global blocks or custom layouts, or change menus, site SEO settings or redirects. Catalog/Common Issues editors stay open to every signed-in role.
  - UI: delete and bulk publish are hidden for editors. In the builder, an editor's Publish shows "Only an admin can publish…"; the autosaved draft stays for an admin (`/preview/<slug>`).
  - Verified as the seed technician (localhost): no delete buttons; Publish on About refused by the server.
- [x] 4.7 Legal pages and Warranty editable in the builder (done 2026-11-22; Supply chain left coded)
  - New block **"Legal / text page"** (`LegalDocumentBlock`, view `src/puck/components/LegalDocument.tsx`): breadcrumb, H1, "Last updated" line, rich-text body, closing section + contact card, footer links; the design lives in the component's styles, so editing text can't break it. A quote in the body shows as the grey notice box.
  - Privacy, Terms, Accessibility now have a layout with that block; the text was copied from the live pages (`scripts/cms-legal-to-blocks.mjs`, backup `scripts/backup-legal-pages-*.json`). Text identical word for word; only visual change: Terms' two all-caps notices lost their monospace font.
  - Warranty: new site section **"Warranty page"** (`src/components/site/WarrantySection.tsx`, text in `warrantyContent.ts`): badge, headline, intro, covered / not covered lists, claim steps, contact box (`{phone}` = store phone), both buttons. The route's built-in version uses the same component. Layout created by `scripts/cms-warranty-to-section.mts` (backup kept). Output identical.
  - Verified: edit in the builder → publish → live (Privacy "Last updated" line; Warranty intro) → restored; mobile no overflow; snapshot of all 4 pages = baseline.
  - The coded versions stay as a fallback (used only without a layout). Supply chain (client page with two tabs) stays coded; its SEO is editable.
- [x] 4.8 Rebuild the 4 hidden preset templates with current block types (`scripts/cms-rebuild-preset-templates.mjs`, from the old builder home blocks; backup in `scripts/backup-templates-*.json`)
- [x] 4.9 Give the Home site sections editable fields (headings, copy, images). **All 9 sections done 2026-11-22.**
  - A registered section can declare `fields` + `defaults` (`HostSection` in `src/puck/host.tsx`); the Site Section block shows them under "Content" and passes the values as props. Empty inputs fall back to the built-in text (shown as placeholders).
  - Hero fields: badge, headline (H1), subtitle, button text/link, background photo (media library) + alt text, status pill text/link. Defaults live in `src/components/home/heroContent.ts`. Images from hosts next/image doesn't know render unoptimized instead of failing.
  - Defaults are only copied into a block when a section is added or switched, never on load, so opening the editor doesn't create a false draft.
  - Fixed in passing: autoTabs left out fields added by `resolveFields`.
  - Verified: headline edited → canvas updates → published → live H1 changed → History "Restore" → published → original back.
  - Other 8 sections: content types + defaults in `src/components/home/sectionContent.ts`; fields registered in `src/plugins/repair-shop/siteSections.tsx`. Lists (cards, repair links, reviews, FAQs) are add/remove/reorder arrays; an empty list falls back to the built-in one.
  - Home FAQ schema is built from the FAQ section's edited questions (`homeFaqItems`).
  - Current content stored in the home layout by `scripts/cms-home-store-section-content.ts` (run with `npx tsx`).
  - Default fixes: "Learn About Our Warranty" → /warranty (was /about); "View All 24 Repair FAQs" → "View All Repair FAQs" (the FAQ page has 19).
  - Verified: section heading edited in the builder → published → live; FAQ question change → schema follows; mobile has no overflow and no console errors. Test edits and test History entries removed.
  - Owner to check numbers now editable in the builder: "2,400+ reviews" (Reviews) vs 420+/500+ elsewhere, "50,000+ devices" (Why choose us).
- [x] 4.10 Production build + Lighthouse on Home after the switch. Mobile, local, 2 runs: performance 50–53, accessibility 96, best practices 100, SEO 100, CLS 0, LCP ~6.6 s, TBT ~1.0–1.3 s.
  - Fixed: the hero photo now has `fetchPriority="high"` (it was fetched at Low priority), and Leaflet (map JS/CSS/tiles) only loads when the map nears the viewport.
  - Real cause of the slow mobile score, site-wide and older than the switch: every public page ships the Puck **editor** bundle plus all lucide icons (~1 MB raw chunk, 622 KB JS total), because the public renderer imports the full editor config. `/privacy` (no builder layout) carries the same chunk.
- [x] 4.11 Stop shipping the editor to visitors (done 2026-11-22)
  - Public pages render builder data with `src/puck/render/PuckRender.tsx` (a faithful port of Puck's server Render: same props, slot wrappers, `puck` prop) and a **generated render-only config**: `npx tsx scripts/gen-puck-render-config.ts` strips fields/renderFields/resolve*/defaultProps from `src/puck/config.tsx`, the column block and the site-section registry into `src/puck/render/generated/`. **Re-run it after changing blocks or site sections.**
  - Style engine split: render half in `src/puck/style/styleRender.tsx` (shared by editor and site), Design panel stays in `withStyleEngine`. Host split: public `siteHost.tsx`, editor additions in `builderHost.tsx`.
  - Icons: `RenderItemIcon` bundles ~100 common icons; any other lucide icon loads on demand (was: all icons on every page). Seed data no longer in the public bundle.
  - Bug caught: Site Section content was only passed when the section had fields; with fields stripped, edited home/hub text would have been ignored. Now always passed.
  - Verified: a temporary side-by-side route rendered all 18 DB layouts with old Puck Render vs the new renderer: identical HTML except Puck's extra outer `<div>` (no CSS uses it) and a React Suspense counter. 13-page snapshot identical. Editor still works (fields, media library).
  - Result (production build, local mobile Lighthouse): First Load JS home 586 → 213 kB, other pages ~562 → 188 kB. Home performance 50–53 → 76–78, LCP 6.6 → 3.7 s, TBT 1.0–1.3 → 0.4–0.5 s, JS 622 → 252 KB; /privacy 69 → 88.

## Phase 6: Every page editable, WordPress-style (requested 2026-11-22)
Goal: every public URL (blogs, repair categories/devices/issues, common issues, locations), with CPR-style routing, is maintained from the dashboard with Puck. WordPress model: one **template per page type** (like theme templates) + **records** (like posts) + optional **per-URL custom layout**.

### Route inventory (2026-11-22)
| Route | Pages | Content source today | Editable today? |
|---|---|---|---|
| Static pages (/, about, faq, repairs hub, review, repair-status, legal, warranty) | ~14 | DB `cms_pages` + Puck | Yes (Phases 1–4) |
| `/blog`, `/blog/[slug]` | 3 posts | DB `blogPost` (admin Blog editor) | Post text yes; layout no |
| `/repairs/[category]` | 4–5 | none: redirects to the first device | No (not a hub like CPR) |
| `/repairs/tablet` | 1 | code (custom hub built earlier) | No |
| `/repairs/[category]/[serviceId]` | ~30 | code: `src/data/servicesData.ts`, `src/lib/pSeoEngine.ts` | No |
| `/repairs/[category]/[serviceId]/[issue]` | hundreds (device × issue) | code: `pSeoEngine` | No |
| `/common-issues`, `/common-issues/[category]/[slug]` | ~20 | code data | No |
| `/locations/i/book-repair`, `/review/[storeSlug]` | 1 + 3 | `src/lib/stores.ts` + settings | No |
| `/schedule-repair` | 1 | code wizard | Kept coded (conversion page) |
Gap: admin Device models / Issue types / Categories / Brands save to DB (`taxonomyStore`), but the repair pages read code files, so those admin edits never reach the site.

### Design
- **Type templates** = `cms_pages` rows with category `Template` (slug `template-<type>`), not routable themselves. They reuse the editor, drafts, revisions, preview and SEO panel already built.
- **Data blocks**: new Puck blocks that read the current record from a route-data context (e.g. Device hero, Price table, Issue list, Related devices, Post body, Post meta). The template preview in the editor picks a sample record.
- **Per-URL override**: a published `cms_pages` row whose path equals a dynamic URL replaces the template for that one page (like editing one WP page by hand).
- **SEO stays per record**: title/description patterns in the template with `{device}`, `{issue}`, `{category}` placeholders; a record can override them. Schema (Service, FAQPage, BreadcrumbList) is built from the record.

### Steps
- [~] 6.1 Template engine: route-data context, `Template` page category, data-block registry, editor sample-record picker, render path for dynamic routes (+ per-URL override check)
  - Done: `RouteDataProvider`/`useRouteData` (`src/components/site/RouteDataContext.tsx`), template helpers (`src/lib/cmsTemplates.ts`), `Template` category (Admin > Pages > "Templates" filter; never served as a URL), editor and `/preview` load a sample record, "View page" opens the sample's real URL. `scripts/cms-ensure-templates.mjs` creates missing templates.
  - Per-URL override is wired for blog posts (a published `cms_pages` row with path `/blog/<slug>`) but not yet tested in the browser.
  - Left: pick the sample record in the editor (now: newest post), a generic helper for other routes.
- [~] 6.2 Blog post template (first, smallest: 3 DB posts already) + blog index template
  - Done: "Template: Blog post" with the "Blog post: full article" data block. Posts look the same as before; schema unchanged. Verified: inserting a banner in the template showed on all 3 posts (test reverted).
  - Left: split the article into finer blocks (header, body + TOC, FAQ, author, related posts); blog index template.
- [x] 6.3 Repair catalog to DB as the single source: categories, brands, devices, issues, prices (seed from `servicesData` + `pSeoEngine`; admin editors read and write it)
  - Found: three overlapping catalogs. `pSeoEngine` (19 devices × 6 repair types, prices/symptoms/FAQs) drives the device and issue pages; `servicesData` has 5 "service" pages; Admin Device models / Issue types / Categories / Brands edit a separate `taxonomyStore` list (22 models, 14 issues) with different ids, which only the /repairs hub and mega menu read.
  - **6.3a done:** the device and repair-type catalog lives in the DB (`taxonomy_store` rows `catalog-devices`, `catalog-repairs`, seeded from code on first read) via `getRepairCatalog()` (`src/lib/repairCatalog.ts`, cached per request, falls back to code if the DB is down). The engine functions take the catalog as an argument. Device pages, issue pages, the /repairs hub fallback and /schedule-repair (metadata + content) read it.
  - Verified with `scripts/snapshot-pages.mjs`: 13 sample URLs have identical title, description, text and JSON-LD before/after. A DB price change shows on the page immediately (tested, restored).
  - Security: `saveTaxonomyAction` now requires an admin login (it had none).
  - **6.3b done (editors):** Admin > **Device Models** now edits the DB devices (`src/components/admin/catalog/DevicesEditor.tsx`); new Admin > **Repair Types & Prices** edits repair types: price, OEM multiplier, turnaround, symptoms, bench steps, tools, FAQs (`RepairTypesEditor.tsx`). Saves go through `src/actions/repairCatalog.ts` (admin-only, validates unique/valid slugs, price > 0, refreshes /repairs and /schedule-repair). Slug and category are locked on existing items (they are part of live URLs); delete warns about 404s. The /repairs hub fallback device grid reads the catalog (fixes its broken `schedule-repair?device=` links).
  - Verified in the browser: device specs edit → live device page; screen price $89 → $99 → live title. Test data restored by reseeding; 13-page snapshot identical to the baseline.
  - **Still open:** the 5 `servicesData` service pages (iphone-repair, ipad-repair…) are not in the catalog yet; Admin > Issue Types / Categories / Brands still edit the older taxonomy lists (used by the /repairs hub issue cards and the mega menu admin); the admin RichTextEditor's device picker still uses the built-in list.
- [x] 6.4 CPR-style `/repairs/[category]` hubs as real pages (smartphone, tablet, computer, console) from a category template; retire the redirect
  - `/repairs/smartphone`, `/tablet`, `/computer`, `/console` are now 200 pages (they were 307 redirects to one device). One generic hub (`src/components/repairs/CategoryHub.tsx`, the earlier tablet design): Devices / Brands / Common Repairs tabs come from the repair catalog; text per category in `categoryHubContent.ts`.
  - Each hub is a page in Admin > Pages ("… Repair (hub)", path `/repairs/<category>`) with the "Repairs: category hub" block. Headline, intro, hero photo, platform cards, warranty and store text are editable per category; other blocks can be added around it. The editor and `/preview` load that category's catalog entries. The archived smartphone/computer rows were reused (old layout kept in History, JSON backup).
  - SEO: per-category title/description (editable in the SEO panel), canonical, BreadcrumbList + ItemList of device pages.
  - Removed routes: `repairs/smartphone/page.tsx`, `repairs/computer/page.tsx` (redirects), `repairs/tablet/*` (replaced by the generic hub).
  - Verified: 4 hubs 200 with their own H1/title/schema; all hub repair links 200; 13-page snapshot of device/issue pages unchanged; editor shows hub with data; mobile no overflow.
  - Notes: tablet and computer have no repair types in the catalog yet, so their hubs show Devices/Brands only; the site menu links `/repairs/ipad`, `/iphone`, `/mac` still go through 307 redirects (fix with 6.9).
- [x] 6.5 Device template (`/repairs/[category]/[device]`) and issue template (`/repairs/.../[issue]`) with data blocks; keep URLs, titles and schema identical at switch-over
  - "Template: Device page" and "Template: Repair page" (Admin > Pages > Templates) with the data blocks "Repairs: device page" / "Repairs: repair page" (`src/components/repairs/RepairPageSections.tsx`). Both routes: this URL's own published page → type template → built-in design (`pickLayout`). Editor and `/preview` show the newest device / its first repair (`src/lib/repairTemplateSamples.ts`); "View page" opens that sample's URL.
  - **Bug fixed:** repair (issue) pages had no site footer at all (hundreds of pages); they now get it. Device pages keep exactly one footer (it moved after the template's blocks).
  - **Cache fix:** publishing a type template now refreshes every page of its type (`revalidatePath("/repairs" | "/blog", "layout")` in `upsertCmsPageAction`). Before, pre-rendered pages could serve the old layout once after a publish.
  - Verified in two stages with `scripts/snapshot-pages.mjs`: (1) the only change is the footer appended to the 4 sampled repair pages (old text is an exact prefix); (2) switching to templates changed nothing else. Template edit (banner) reached all repair pages and not device pages; reverted via History + Publish, fresh on the first request. Lint/type-check clean.
  - Left: split the big data blocks into smaller ones (hero, price box, FAQ…) so admins can rearrange inside a page; per-URL override is wired but untested in the browser.
- [x] 6.6 Common issues to DB + template; locations/store pages template
  - **Common issues done (2026-11-22):** the 9 articles live in the DB (`taxonomy_store` row `common-issues`, `getCommonIssues()` in `src/lib/commonIssuesStore.ts`, seeded from code, code fallback). New **Admin > Common Issues** editor (`CommonIssuesEditor.tsx`): title, lead, photo, sections (heading, paragraphs, bullet/numbered list), related articles, SEO; admin-only save (`src/actions/commonIssues.ts`) with validation. "Template: Common issue" + data block; per-URL override; publishing the template refreshes all articles. Editor/preview sample = first article.
  - Shared `src/lib/pickLayout.ts` now used by the device, repair and common-issue routes.
  - **Bug fixed:** related articles ignored each article's list (`|| true`), so every article showed the same first 4 (a phone article listed the console HDMI one). Now: chosen related first, then others, up to 4.
  - Verified: DB switch and template both identical on all 10 URLs (index + 9); admin edit → live → restored; only change after the fix is the related list on each article; repair pages unchanged after the helper refactor.
  - **Rest done (2026-11-22):** the `/common-issues` index reads the DB articles (plus non-article service shortcuts). `/locations/i/book-repair` is a CMS page (`locations-book-repair`: store finder section + 2 home sections, editable/reorderable); same output as before.
- [x] 6.7 Admin "Theme builder" screen: list of page types → edit template, see which URLs use it, per-URL overrides (done 2026-11-22)
  - **Admin > Theme Builder** (`/admin/theme-builder`): one card per page type (Blog post 3 pages, Device page 24, Repair page 58, Common issue 9) with template status, Edit template / Preview, page count + sample URLs, its custom layouts (Edit / Remove), and "Customize" for any single URL; plus the 4 category hubs.
  - Page-type registry `src/lib/themeTypes.ts` (URLs per type, type of a path, the record a URL renders); actions `src/actions/theme.ts` (admin-only; create only for real URLs; remove only custom layouts of single pages).
  - A custom layout starts as a Draft copy of the template and only goes live when published. Its editor and `/preview` show that exact page's record (not a sample).
  - Verified: customize `/repairs/smartphone/iphone-16-pro` → Draft → editor shows that device → banner + publish → only that URL changed (not iPhone 16, not its repair pages) → Remove → back to template, row deleted.
  - **Bug fixed (found while testing):** `/repairs/smartphone/iphone-16`, `iphone-15`, `iphone-14` (and their ~15 repair pages) showed the **Pro** model: the device lookup matched "name contains" before an exact slug. Exact slug now wins (19/19 devices correct). Only the sampled iPhone 15 page changed in the snapshot, and it now correctly says iPhone 15.
- [x] 6.8 Sitemap and redirects from the DB (`urlRedirect` exists); check every old URL still resolves (done 2026-11-22)
  - **Sitemap was wrong:** 26 URLs incl. 4 template URLs that 404 (`/_templates/...`), `/reviews` (404), `/track` and `/locations` (redirects), all blog posts regardless of status; **missing every device, repair and common-issue page**. Now (`src/app/sitemap.ts`): 113 URLs from the DB: core pages, published CMS pages (incl. hubs/legal, no templates), published blog posts, all device/service, device × repair and common-issue pages (via `listTypeUrls`), skipping redirect sources and aliases. A stored canonical is only used when it names the same page (`/track`'s pointed at the redirect).
  - **Redirects:** DB rules marked 301 were served as 307 (temporary); now 301/308 rules use `permanentRedirect` (308). Three rules chained through a second redirect; `scripts/fix-redirect-chains.mjs` pointed them at the final pages (backup kept).
  - **Security:** SEO write actions (site SEO settings incl. robots/sitemap switches and webmaster tokens, redirect create/edit/delete/toggle) had no login check; now admin-only.
  - Verified with `scripts/check-site-urls.mjs` (re-runnable): all 113 sitemap URLs answer 200; all 10 old/alias URLs redirect in one hop to a 200 page (308 for permanent rules).
  - Note: the code aliases (`/track`, `/locations`, `/repairs/iphone|ipad|mac`, `/california-supply-chain-act`) stay temporary (307) on purpose, so they can still become real pages later.
- [x] 6.9 Menus and blog index from the DB (done 2026-11-22)
  - Found: visitors **always saw the built-in default menu**. Admin > Navigation saved to the DB, but the public Navbar/TopBar read only browser localStorage. The mega menu was never in the DB at all (localStorage only). `saveNavMenuAction` had no login check.
  - Now: the site layout loads both menus from the DB on the server (`getNavMenuAction`, new `getMegaMenuAction`, row `mega_menu` in `nav_menus`) and passes them to TopBar/Navbar, so menus are server-rendered and the same for everyone. Both admin editors read and write only the DB, admin-only, with real error messages. The mega-menu editor offers back earlier browser-only edits once if nothing was saved yet.
  - jsonb reorders object keys, so the mega menu tab order is now fixed in code (`MEGA_CATEGORY_ORDER`).
  - Blog index: `/blog` server HTML had **0 posts** (client-only list). Now a server page loads posts from the DB (`BlogHubClient` keeps search/filters) and has its own title/description/canonical. Blog categories are still the built-in list (not stored in the DB).
  - Redirect hops removed: footer and saved home/repairs layouts and header menu now link to final URLs (`/repairs/iphone` → `/repairs/smartphone/iphone-repair`, `/ipad` → `/repairs/tablet/ipad-repair`, `/mac` → `/repairs/computer/imac-repair`; `scripts/cms-fix-redirect-links.mjs`, backup kept). Footer label "iPod Repair" → "iPad Repair".
  - Verified: admin menu label edit → visible to a plain visitor (no browser storage) on several pages → restored; mega menu save creates the DB row; 13-page snapshot: only change is the footer label. Lint/type-check clean.
  - **Done later (2026-11-22):** `llms.txt` links point at real pages. Found: the `/<page>.md` rewrite never passed the path, so **every `.md` URL (even `/zzz.md`) returned the homepage**; fixed (`next.config.mjs` + `src/app/api/markdown/route.ts`), unknown ones now 404, and drafts/templates/global blocks are never served as Markdown. Blog categories are in the DB (`taxonomy_store` row `blog-categories`): **Admin > Guides & Blog > Categories** (add/rename/remove; a used category can't be removed); `/blog` and the article editor read them. Verified: test category → shown on /blog → removed.
- Do 4.11 (slim public renderer) before 6.5, since templates put Puck rendering on hundreds more pages.

## Phase 7: Remove AI slop, polish design, more Elementor-style elements (requested 2026-11-22)
Goal: the dashboard and the site look made by a person for this shop: no invented numbers, people or reviews, no filler buzzwords or decoration; and the builder gets the common Elementor widgets it lacks.

### Audit (2026-11-22)
- **Invented data shown as real (worst):**
  - Admin home (`/admin`, "Operations overview"): every number, chart and name is hard-coded (24 inquiries, 148 repairs, revenue chart, customers, "+24 pts" tasks). No data action is called. Admin > Reviews and AI visibility pages: same (hard-coded arrays).
  - The DB has no real repair, review or revenue data yet: `repairs` 0 rows, `reviews` 0, `leads` 8 seed rows (all created the same second).
  - Home "Reviews" section shows 3 invented customers ("Marcus Thorne", "Elena Rostova", "David K. Campbell") with "Verified" badges; the same names are reused as fake leads in admin mock data. Legal risk (FTC fake-review rule).
  - `/review/[storeSlug]` gives a "$5 counter reward" code for leaving a review: incentivized reviews break Google's review policy.
- **Filler copy:** "Laboratory" / "Philadelphia Laboratory Spec" badges, "state-of-the-art", "world-class", repeated "100% …" on repair/issue/blog pages.
- **Decoration:** gradients (site 17, dashboard 9), backdrop-blur (16 / 13), pulse/ping animations, `Sparkles` icons (16 / 37), emoji in the dashboard (10), big shadows.
- **Jargon in the dashboard:** AEO / Knowledge Graph / pSEO / LLM (126 mentions); category name "Site Sections & Live Portals" in the builder.
- **Builder gaps vs Elementor:** no Icon Box, Image Box, Icon List, Star Rating, Image Gallery/Carousel, Progress Bar, Social Icons, Alert, Menu Anchor, Table of Contents, Countdown, Price List, Flip Box; for a repair shop also Before/After slider.

### Owner decisions (2026-11-22)
- Invented home reviews: remove them (names + "Verified"); the section stays hidden until the owner supplies real reviews, then they are entered in the builder.
- `/review/<store>` $5 reward: **keep as is** (owner's call; risk noted above).
- Admin home: replace with a real site overview from the DB.

### Steps
- [x] 7.1 Dashboard (done 2026-11-22)
  - **Admin home** is a real overview from the DB (`src/actions/overview.ts`): live/draft/scheduled pages, blog posts, open leads, redirects, recently edited, scheduled, latest leads, and "Needs attention" (real SEO problems: 16 found, e.g. titles over 60 characters). The invented numbers, charts and customers are gone.
  - **Leads** page: no invented starting list (25 fake leads showed when the DB was empty); saves/deletes report real failures.
  - **Security:** `getLeadsAction` / update / delete had **no login check** (anyone could read customers' names and phones). Now admin-only; the public booking form still works.
  - Reviews, Listings (+ API sync, catalog, AI visibility), Local SEO and Services are still mock-ups with no real integrations: they now show a clear "Sample data, not connected yet" notice (`SampleDataNotice` in the dashboard layout).
  - Removed hard-coded KPI strips with made-up claims (Categories, Brands, Issue types: "35+ Models", "100% Complete", "100% Valid"…), all emoji, decorative gradients, Sparkles used as generic icons. Plain page titles/subtitles on every admin page; "RankMath SEO" → "SEO checklist"; jargon ("pSEO Juicy Link", "LLM/AI Answer Engine discoverability", "entity trust") rewritten.
  - **Media:** header rewritten (one-line buttons, file count), loading/empty states (a slow first load looked like "0 files"), honest upload hint (JPG/PNG/WebP/GIF/AVIF, 10 MB; it claimed SVG + automatic optimization).
- [x] 7.2 Site (done 2026-11-22)
  - Invented reviews removed (owner decision): Home reviews section hidden until real reviews are entered (no "Verified" badge, no built-in reviews), About and Review testimonial walls removed, the coded `/review` list and the seed layouts cleaned; the Testimonial widget starts with a neutral placeholder. Backups `scripts/backup-invented-reviews-*.json`. No review structured data was affected.
  - Spec tables on device / repair / common-issue / blog pages: "Philadelphia Laboratory Spec", "Verified Lab Spec", "$0.00 (100% Free Upfront Hardware Assessment)", "OEM Original & Premium Grade-A+"… → plain facts ("Free", "90 days on parts and labor", "We don't erase your data"). **Fixed a wrong claim:** "Walk-ins Welcome Daily" (stores are Mon–Sat). "iPhone Repair Repair & Diagnostics" duplicate fixed.
  - Filler removed: "100% …", "state-of-the-art", "world-class", "premier", "blazing-fast", "peace of mind", "master technicians", hero badge "Philadelphia's Trusted Leader in" (an unfinished sentence) → "Phone & computer repair in Philadelphia", "Expert Solutions for Your Everyday Tech" → "Why customers choose us". Saved layouts updated with backup (`scripts/backup-plain-copy-*.json`), DB catalog FAQ too.
  - Calmer UI: no pinging/pulsing navbar dots or bouncing menu pill, no decorative gradient bars/boxes or glow blob. Dark overlays on hero photos kept (they keep text readable).
  - **Owner to confirm (numbers not changed):** reviews and ratings differ by page: 420+ (Review), 500+ (About, Locations, Review stats), 2,400+ (old home text), 4.9★; repairs: "50,000+ devices" (Home) vs "5,000+ local repairs" (blog). Pick the true numbers and they can be set in the builder.
- [x] 7.3 Builder: new **General** category with 13 widgets (`src/puck/widgets/general.tsx`, interactive parts in `views.tsx`): Icon Box, Image Box, Icon List, Star Rating, Image Gallery (lightbox, keyboard), Before/After slider (drag + arrow keys), Price List, Progress Bars, Social Icons, Alert, Countdown, Table of Contents (reads the page's H2/H3), Menu Anchor. Each has Content/Style/Advanced tabs, lock, device visibility, scoped CSS; the public site gets a render-only copy (generator updated). Categories renamed ("Site sections"). Verified on a temporary page (all render, no console errors, no overflow, lightbox and slider work, editor shows them) and removed.
- [x] 7.4 Verified: type-check and lint clean, sitemap 113 URLs 200, snapshots: only the intended text changed.
- Not done: Flip Box widget (skipped on purpose: hard to use accessibly); the mock-up admin areas still need real integrations (Google Business, Yelp) or removal: owner decision.

## Phase 5: Cleanup
- [~] 5.1 Payload (A11): checked 2026-11-22, **owner decision needed**
  - The app never uses Payload's runtime: no Payload admin screen, no code calls its REST API (`src/app/api/[...slug]/route.ts`, collections in `src/collections/`). The app does read tables Payload created (locations, faqs, …) through Prisma, so those tables must stay.
  - **Danger found and fixed:** in dev, the first request to any unknown `/api/...` path started Payload, which "pushed" its schema and asked (y/N) to **drop 23 of the app's tables** (cms_pages, blog_posts, AdminUser, nav_menus, url_redirects, taxonomy_stores…). Answered by nobody (server stopped, all data checked intact). `payload.config.ts` now has `push: false`; re-tested: no prompt. Anonymous Payload API calls get 403; Payload has 1 user, so "first user" sign-up is closed.
  - Recommendation: remove the Payload packages, `payload.config.ts`, `src/collections/`, the `/api/[...slug]` route and `withPayload` (keep the tables and Prisma models).
- [x] 5.2 Browser-storage (localStorage) code removed (done 2026-11-22)
  - Deleted the unused helpers (pages, taxonomy, models, blogs, blog categories, media, nav and mega menu) and their storage keys.
  - Admin > Categories, Brands, Issue Types and Guides & Blog kept a browser copy and **swallowed DB errors** (could say "saved" when nothing was saved). Now DB-only with real error messages.
  - Kept on purpose: the builder's own localStorage adapter (`src/puck/storage`, for running the builder outside this app) and the Mega Menu's one-time offer of old browser-only edits.
  - **Security:** blog write actions had **no login check** (anyone could create/edit/delete posts); now admin-only, delete admin role only, editors save drafts only. GMB post create/delete (`src/actions/localSeo.ts`, also behind the unused `/api/gmb/posts`) had none either; now admin-only.
  - **Draft posts were public:** the public blog actions returned drafts (reachable at `/blog/<slug>`, listed, full text in the `/blog` page data). Public actions now return Published only; admin screens use new admin-only actions. A post that is a draft in the DB no longer falls back to the built-in copy. Verified: post → Draft → 404 / not listed / `.md` 404, still in the admin → restored.
- [x] 5.3 Production build + Lighthouse on key pages (done 2026-11-22)
  - `next build` passes. First Load JS: shared 129 kB; legal pages/warranty 191 kB, /blog 148 kB, /about 199 kB.
  - Local mobile Lighthouse, 2 runs each (perf / a11y / best practices / SEO, LCP): Home 73–75 / 96 / 100 / 100, 4.0 s · Privacy 83–89 / 94 / 100 / 100, 3.0 s · Terms 82–86 / 94 · Warranty 85–91 / 94 · Blog 82–84 / 96, 3.3 s · iPhone device page 73–76 / 96 / 96 / 100, 4.0–4.2 s. CLS 0 everywhere. In line with 4.11.
  - Found, not fixed (follow-ups): the **iPhone 15 photo is gone from Unsplash** (404 upstream: `photo-1695048133142-…`, used in `categoryHubContent.ts`, `servicesData.ts`, `pSeoEngine.ts` and likely the DB catalog) → broken image and a console error on iPhone pages; the owner should pick a replacement. Site footer: one low-contrast span and `h4` headings that skip a level (a11y 94 on pages whose content ends in H2).

---

## Working rules
- Keep Puck + Prisma as they are. No new CMS.
- Back up `cms_pages` before any DB write script (`scripts/backup-*.json`, not committed).
- Use test admin credentials from `prisma/seeds/admin.seed.ts` on localhost only.
- Each phase ends with a browser check: admin edit → public page.
- Nothing from this work is committed yet (owner said "not yet").
