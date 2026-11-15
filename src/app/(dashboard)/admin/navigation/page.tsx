"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Layers,
  Link2,
  Megaphone,
  Menu,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import {
  DEFAULT_NAV_MENU,
  getStoredNavMenu,
  newNavId,
  saveStoredNavMenu,
  type NavItem,
  type NavItemStyle,
  type NavItemType,
  type NavMenuConfig,
} from "@/lib/navMenuData";
import { getStoredCMSPages } from "@/lib/cmsData";
import { getNavMenuAction, saveNavMenuAction } from "@/actions/navMenu";
import { getCmsPagesAction } from "@/actions/cmsPages";

const inputCls =
  "h-[34px] w-full rounded-[6px] border border-[#d1d5db] bg-white px-2.5 text-[13px] focus:outline-none focus:border-[#009691]";
const labelCls = "flex flex-col gap-1 text-[12px] font-semibold text-gray-700";

const TYPE_OPTIONS: { value: NavItemType; label: string; hint: string }[] = [
  { value: "link", label: "Link", hint: "Goes straight to a page." },
  { value: "dropdown", label: "Dropdown", hint: "Opens a small list of sub-links." },
  { value: "mega", label: "Mega menu", hint: "Opens the big panel. Its content is edited in Mega Menu Builder." },
];

const STYLE_OPTIONS: { value: NavItemStyle; label: string }[] = [
  { value: "plain", label: "Plain text" },
  { value: "pill", label: "Highlight (filled, live dot)" },
  { value: "outline", label: "Highlight (outlined)" },
];

/** Link field with the site's pages offered as suggestions. */
function LinkInput({
  value,
  onChange,
  pages,
  listId,
}: {
  value: string;
  onChange: (v: string) => void;
  pages: { name: string; path: string }[];
  listId: string;
}) {
  return (
    <>
      <input
        className={`${inputCls} font-mono`}
        value={value}
        list={listId}
        placeholder="/page or https://..."
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {pages.map((p) => (
          <option key={p.path} value={p.path}>
            {p.name}
          </option>
        ))}
      </datalist>
    </>
  );
}

export default function NavigationBuilderPage() {
  const [config, setConfig] = useState<NavMenuConfig>(DEFAULT_NAV_MENU);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_NAV_MENU.items[0].id);
  const [activeTab, setActiveTab] = useState<"items" | "extras">("items");
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pages, setPages] = useState<{ name: string; path: string }[]>([]);

  useEffect(() => {
    // 1. Instant local cache
    const stored = getStoredNavMenu();
    setConfig(stored);
    if (stored.items[0]) setSelectedId(stored.items[0].id);
    setPages(getStoredCMSPages().map((p) => ({ name: p.name, path: p.path })));

    // 2. Load from PostgreSQL via Server Action
    getNavMenuAction()
      .then((res) => {
        if (res.success && res.menu) {
          setConfig(res.menu);
          saveStoredNavMenu(res.menu);
          if (res.menu.items[0]) setSelectedId(res.menu.items[0].id);
        }
      })
      .catch(console.error);

    getCmsPagesAction()
      .then((res) => {
        if (res.success && res.pages) {
          setPages(res.pages.map((p) => ({ name: p.name, path: p.path })));
        }
      })
      .catch(console.error);
  }, []);

  const flash = (ok: boolean, text: string) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 3000);
  };

  const update = (next: NavMenuConfig) => {
    setConfig(next);
    setDirty(true);
  };

  const selected = config.items.find((i) => i.id === selectedId) || null;

  const patchItem = (id: string, changes: Partial<NavItem>) =>
    update({ ...config, items: config.items.map((i) => (i.id === id ? { ...i, ...changes } : i)) });

  const handleSave = async () => {
    const empty = config.items.find((i) => !i.label.trim());
    if (empty) return flash(false, "Every menu item needs a label.");

    saveStoredNavMenu(config);
    setDirty(false);

    const res = await saveNavMenuAction(config);
    if (res.success) {
      flash(true, "Menu saved to PostgreSQL. The site header now shows it live.");
    } else {
      flash(false, `Saved locally, but DB sync failed: ${res.error}`);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset the menu, header button and top bar to the original defaults?")) return;
    setConfig(DEFAULT_NAV_MENU);
    setSelectedId(DEFAULT_NAV_MENU.items[0].id);
    saveStoredNavMenu(DEFAULT_NAV_MENU);
    await saveNavMenuAction(DEFAULT_NAV_MENU);
    setDirty(false);
    flash(true, "Menu reset to defaults in PostgreSQL and browser.");
  };

  const addItem = () => {
    const item: NavItem = { id: newNavId("nav"), label: "New link", href: "/", type: "link", style: "plain" };
    update({ ...config, items: [...config.items, item] });
    setSelectedId(item.id);
    setActiveTab("items");
  };

  const removeItem = (id: string) => {
    const items = config.items.filter((i) => i.id !== id);
    update({ ...config, items });
    if (selectedId === id) setSelectedId(items[0]?.id || "");
  };

  const moveItem = (id: string, toIndex: number) => {
    const from = config.items.findIndex((i) => i.id === id);
    if (from < 0 || toIndex < 0 || toIndex >= config.items.length || from === toIndex) return;
    const items = [...config.items];
    const [moved] = items.splice(from, 1);
    items.splice(toIndex, 0, moved);
    update({ ...config, items });
  };

  const hasMega = config.items.some((i) => i.type === "mega");
  const visibleItems = config.items.filter((i) => !i.hidden);

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5 overflow-x-hidden">
      {/* 1. TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8e8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] sm:text-[24px] font-bold text-[#111111] tracking-[-0.02em]">Menu Builder</h1>
            {dirty && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#5f6368] mt-0.5">
            Header menu items, sub-menus, the header button and the top bar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="h-[34px] px-3.5 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-gray-50 text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="h-[34px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-gray-50 text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-[34px] px-4 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-[13px] font-semibold inline-flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Menu</span>
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`rounded-[6px] border px-3 py-2 text-[13px] font-medium inline-flex items-center gap-2 ${
            toast.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {toast.ok && <Check className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      {/* 2. LIVE PREVIEW OF THE HEADER */}
      <div className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden shadow-2xs">
        <div className="flex items-center justify-between bg-[#fafafa] border-b border-[#e8e8e8] px-4 py-2">
          <div className="flex items-center gap-2 text-[12px] font-bold text-gray-600 uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            Live preview
          </div>
          <span className="text-[11px] text-gray-500">Click an item to edit it</span>
        </div>

        {config.topBar.enabled && (
          <div className="bg-[#009691] text-white text-[12px] px-4 sm:px-8 h-[34px] flex items-center justify-between">
            <span className="font-medium truncate">{config.topBar.tagline}</span>
            <span className="shrink-0 pl-3">
              <span className="text-white/80">{config.topBar.phoneLabel}</span> <b>{config.topBar.phone}</b>
            </span>
          </div>
        )}

        <div className="px-4 sm:px-8 py-3 flex items-center justify-between gap-4 overflow-x-auto">
          <Image src="/logo-png.jpg" alt="Logo" width={160} height={50} className="h-10 w-auto object-contain shrink-0" />
          <div className="flex items-center gap-5 text-[14px] font-medium text-[#1d1c1a] whitespace-nowrap">
            {visibleItems.map((item) => {
              const isSel = item.id === selectedId && activeTab === "items";
              const ring = isSel ? "ring-2 ring-[#009691] ring-offset-2" : "";
              const pick = () => {
                setSelectedId(item.id);
                setActiveTab("items");
              };
              if (item.type !== "link") {
                return (
                  <button key={item.id} type="button" onClick={pick} className={`flex items-center gap-1 cursor-pointer rounded ${ring} ${item.type === "mega" ? "px-3 py-1.5 border border-[#1d1c1a]" : ""}`}>
                    <span>{item.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                );
              }
              if (item.style === "pill") {
                return (
                  <button key={item.id} type="button" onClick={pick} className={`px-3 py-1 rounded-full bg-[#ccfbf1] text-[#0f766e] font-semibold flex items-center gap-1.5 text-[13px] cursor-pointer ${ring}`}>
                    <span className="w-2 h-2 rounded-full bg-[#0d9488]" />
                    <span>{item.label}</span>
                  </button>
                );
              }
              if (item.style === "outline") {
                return (
                  <button key={item.id} type="button" onClick={pick} className={`px-3.5 py-1 rounded-full border border-[#0d9488] font-semibold text-[13px] bg-[#99f6e4]/30 cursor-pointer ${ring}`}>
                    {item.label}
                  </button>
                );
              }
              return (
                <button key={item.id} type="button" onClick={pick} className={`cursor-pointer rounded hover:text-[#00897b] ${ring}`}>
                  {item.label}
                </button>
              );
            })}
          </div>
          {config.cta.enabled && (
            <button
              type="button"
              onClick={() => setActiveTab("extras")}
              className="shrink-0 px-5 py-2.5 rounded bg-[#00897b] text-white font-bold text-[13px] uppercase tracking-wider cursor-pointer"
            >
              {config.cta.label}
            </button>
          )}
        </div>

        {selected?.type === "dropdown" && activeTab === "items" && (selected.children?.length ?? 0) > 0 && (
          <div className="border-t border-[#f0f0f0] bg-[#fafafa] px-4 sm:px-8 py-3">
            <div className="inline-block w-56 bg-white border border-neutral-200 shadow-md rounded-md py-2 text-[13px]">
              {selected.children?.map((sub) => (
                <div key={sub.id} className="px-4 py-1.5 text-[#1d1c1a]">
                  {sub.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. EDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: item list */}
        <div className="lg:col-span-4 bg-white border border-[#e8e8e8] rounded-[8px] shadow-2xs overflow-hidden self-start">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8e8]">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#111111]">
              <Menu className="w-4 h-4 text-[#009691]" />
              Menu items
            </div>
            <button
              type="button"
              onClick={addItem}
              className="h-[28px] px-2.5 rounded-[5px] bg-[#009691] hover:bg-[#007f7b] text-white text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add item
            </button>
          </div>
          <ul className="p-2 flex flex-col gap-1">
            {config.items.map((item, index) => {
              const isSel = item.id === selectedId && activeTab === "items";
              return (
                <li
                  key={item.id}
                  draggable
                  onDragStart={() => setDragId(item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId) moveItem(dragId, index);
                    setDragId(null);
                  }}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => {
                    setSelectedId(item.id);
                    setActiveTab("items");
                  }}
                  className={`flex items-center gap-2 rounded-[6px] border px-2 py-2 cursor-pointer ${
                    isSel ? "border-[#009691] bg-[#009691]/5" : "border-transparent hover:bg-gray-50"
                  } ${dragId === item.id ? "opacity-40" : ""} ${item.hidden ? "opacity-60" : ""}`}
                >
                  <GripVertical className="w-3.5 h-3.5 text-gray-400 cursor-grab shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-[#111111] truncate">{item.label || "(no label)"}</div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {item.type === "mega" ? "Mega menu" : item.type === "dropdown" ? `Dropdown · ${item.children?.length ?? 0} links` : item.href}
                    </div>
                  </div>
                  <div className="flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button type="button" title="Move up" disabled={index === 0} onClick={() => moveItem(item.id, index - 1)} className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" title="Move down" disabled={index === config.items.length - 1} onClick={() => moveItem(item.id, index + 1)} className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" title={item.hidden ? "Show in menu" : "Hide from menu"} onClick={() => patchItem(item.id, { hidden: !item.hidden })} className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer">
                      {item.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button type="button" title="Delete item" onClick={() => removeItem(item.id)} className="p-1 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
            {config.items.length === 0 && <li className="px-2 py-6 text-center text-[13px] text-gray-500">No menu items yet.</li>}
          </ul>
        </div>

        {/* RIGHT: settings */}
        <div className="lg:col-span-8 bg-white border border-[#e8e8e8] rounded-[8px] shadow-2xs overflow-hidden">
          <div className="flex border-b border-[#e8e8e8]">
            {[
              { id: "items" as const, label: "Selected item", icon: <Link2 className="w-3.5 h-3.5" /> },
              { id: "extras" as const, label: "Header button & top bar", icon: <Megaphone className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-[13px] font-semibold inline-flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  activeTab === tab.id ? "border-[#009691] text-[#007f7b]" : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "items" && !selected && (
            <div className="p-8 text-center text-[13px] text-gray-500">Pick a menu item on the left, or add one.</div>
          )}

          {activeTab === "items" && selected && (
            <div className="p-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={labelCls}>
                  Label
                  <input className={inputCls} value={selected.label} onChange={(e) => patchItem(selected.id, { label: e.target.value })} />
                </label>
                <label className={labelCls}>
                  Link
                  <LinkInput value={selected.href} onChange={(href) => patchItem(selected.id, { href })} pages={pages} listId="nav-pages" />
                </label>
              </div>

              <div className={labelCls}>
                Type
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map((opt) => {
                    const disabled = opt.value === "mega" && hasMega && selected.type !== "mega";
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => patchItem(selected.id, { type: opt.value, ...(opt.value === "dropdown" && !selected.children ? { children: [] } : {}) })}
                        className={`rounded-[6px] border p-2.5 text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                          selected.type === opt.value ? "border-[#009691] bg-[#009691]/5" : "border-[#e5e7eb] hover:border-gray-400"
                        }`}
                      >
                        <div className="text-[13px] font-semibold text-[#111111]">{opt.label}</div>
                        <div className="text-[11px] font-normal text-gray-500 mt-0.5">
                          {disabled ? "The menu already has a mega menu item." : opt.hint}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selected.type === "link" && (
                <label className={labelCls}>
                  Look
                  <select className={inputCls} value={selected.style} onChange={(e) => patchItem(selected.id, { style: e.target.value as NavItemStyle })}>
                    {STYLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {selected.type === "mega" && (
                <div className="rounded-[6px] border border-[#e5e7eb] bg-[#fafafa] p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[13px] text-gray-700">
                    <Layers className="w-4 h-4 text-[#009691]" />
                    The panel&apos;s categories, devices and brands are edited in Mega Menu Builder.
                  </div>
                  <Link href="/admin/mega-menu" className="h-[30px] px-3 rounded-[5px] border border-[#d1d5db] bg-white text-[12px] font-semibold inline-flex items-center gap-1 shrink-0 hover:border-[#111111]">
                    Open
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {selected.type === "dropdown" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-gray-700">Sub-menu links</span>
                    <button
                      type="button"
                      onClick={() => patchItem(selected.id, { children: [...(selected.children || []), { id: newNavId("sub"), label: "New link", href: "/" }] })}
                      className="h-[26px] px-2 rounded-[5px] border border-[#d1d5db] bg-white text-[12px] font-semibold inline-flex items-center gap-1 hover:border-[#111111] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Add link
                    </button>
                  </div>
                  {(selected.children || []).map((sub, i, list) => {
                    const setSubs = (next: typeof list) => patchItem(selected.id, { children: next });
                    const swap = (to: number) => {
                      const next = [...list];
                      [next[i], next[to]] = [next[to], next[i]];
                      setSubs(next);
                    };
                    return (
                      <div key={sub.id} className="flex items-center gap-2">
                        <input className={inputCls} value={sub.label} placeholder="Label" onChange={(e) => setSubs(list.map((s) => (s.id === sub.id ? { ...s, label: e.target.value } : s)))} />
                        <LinkInput value={sub.href} onChange={(href) => setSubs(list.map((s) => (s.id === sub.id ? { ...s, href } : s)))} pages={pages} listId="nav-pages" />
                        <button type="button" title="Move up" disabled={i === 0} onClick={() => swap(i - 1)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" title="Move down" disabled={i === list.length - 1} onClick={() => swap(i + 1)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" title="Delete link" onClick={() => setSubs(list.filter((s) => s.id !== sub.id))} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {(selected.children?.length ?? 0) === 0 && <p className="text-[12px] text-gray-500">No sub-menu links yet.</p>}
                </div>
              )}
            </div>
          )}

          {activeTab === "extras" && (
            <div className="p-4 flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 text-[13px] font-bold text-[#111111]">
                  <input type="checkbox" className="accent-[#009691]" checked={config.cta.enabled} onChange={(e) => update({ ...config, cta: { ...config.cta, enabled: e.target.checked } })} />
                  Header button
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={labelCls}>
                    Button text
                    <input className={inputCls} value={config.cta.label} onChange={(e) => update({ ...config, cta: { ...config.cta, label: e.target.value } })} />
                  </label>
                  <label className={labelCls}>
                    Button link
                    <LinkInput value={config.cta.href} onChange={(href) => update({ ...config, cta: { ...config.cta, href } })} pages={pages} listId="nav-pages" />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#f0f0f0] pt-4">
                <label className="flex items-center gap-2 text-[13px] font-bold text-[#111111]">
                  <input type="checkbox" className="accent-[#009691]" checked={config.topBar.enabled} onChange={(e) => update({ ...config, topBar: { ...config.topBar, enabled: e.target.checked } })} />
                  Top bar (the thin strip above the header)
                </label>
                <label className={labelCls}>
                  Tagline
                  <input className={inputCls} value={config.topBar.tagline} onChange={(e) => update({ ...config, topBar: { ...config.topBar, tagline: e.target.value } })} />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={labelCls}>
                    Phone label
                    <input className={inputCls} value={config.topBar.phoneLabel} onChange={(e) => update({ ...config, topBar: { ...config.topBar, phoneLabel: e.target.value } })} />
                  </label>
                  <label className={labelCls}>
                    Phone number
                    <input className={inputCls} value={config.topBar.phone} onChange={(e) => update({ ...config, topBar: { ...config.topBar, phone: e.target.value } })} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
