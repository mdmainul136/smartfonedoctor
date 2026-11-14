"use client";

import { useState, type ReactNode } from "react";
import {
  AlignHorizontalSpaceBetween,
  ArrowDown,
  ArrowRight,
  ChevronDown,
  EyeOff,
  LayoutGrid,
  Link2,
  Monitor,
  MousePointer2,
  RotateCcw,
  Smartphone,
  Square,
  Tablet,
  WrapText,
} from "lucide-react";
import { usePuckSelect } from "../editor/puckStore";
import { getKitSwatches } from "../kit";
import { compileStyle } from "./compile";
import { HTML_TAGS, type PbStyle, type StyleMap, type StyleScope } from "./types";

/* ------------------------------------------------------------------ helpers */

/** "16" is stored as "16px"; anything else (50%, auto, 2rem) is kept as typed. */
const toCss = (v: string) => (/^-?\d+(\.\d+)?$/.test(v.trim()) ? `${v.trim()}px` : v.trim());
const fromCss = (v: string) => v.replace(/^(-?\d+(\.\d+)?)px$/, "$1");

const inputCls =
  "h-7 w-full min-w-0 rounded border border-gray-300 bg-white px-2 text-[11px] text-gray-800 placeholder:text-gray-400 focus:border-[#009691] focus:outline-none";

function Section({ title, children, open = true }: { title: string; children: ReactNode; open?: boolean }) {
  const [isOpen, setOpen] = useState(open);
  return (
    <div className="border-t border-gray-200">
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-gray-700"
      >
        {title}
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 ${isOpen ? "" : "-rotate-90"}`} />
      </button>
      {isOpen && <div className="flex flex-col gap-2.5 px-3 pb-3">{children}</div>}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[11px] text-gray-500">{label}</span>
      <span className="flex min-w-0 flex-1 items-center gap-1.5">{children}</span>
    </label>
  );
}

type SegOption = { value: string; label?: string; icon?: ReactNode; title?: string };

function Seg({ value, options, onChange }: { value: string; options: SegOption[]; onChange: (v: string) => void }) {
  return (
    <div className="flex w-full rounded-md bg-gray-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.title || o.label}
          onClick={() => onChange(o.value)}
          className={`flex h-6 flex-1 items-center justify-center gap-1 rounded text-[10px] font-semibold ${
            value === o.value ? "bg-white text-[#007f7b] shadow-sm" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ColorInput({ value, placeholder, onChange }: { value: string; placeholder?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-8 shrink-0 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
        />
        <input
          className={`${inputCls} font-mono`}
          value={value}
          placeholder={placeholder || "none"}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {getKitSwatches().map(({ name, value: swatch }) => (
          <button
            key={swatch}
            type="button"
            title={name}
            onClick={() => onChange(swatch)}
            style={{ backgroundColor: swatch === "transparent" ? "#fff" : swatch }}
            className={`h-4 w-4 rounded-sm border ${
              value.toLowerCase() === swatch.toLowerCase() ? "border-[#009691] ring-1 ring-[#009691]" : "border-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const SHADOWS: SegOption[] = [
  { value: "", label: "None" },
  { value: "0 1px 2px rgba(15,23,42,.08)", label: "S" },
  { value: "0 4px 12px rgba(15,23,42,.10)", label: "M" },
  { value: "0 12px 28px rgba(15,23,42,.14)", label: "L" },
  { value: "0 24px 48px rgba(15,23,42,.20)", label: "XL" },
  { value: "0 0 32px rgba(0,150,145,.35)", label: "Glow" },
];

const SIDES = ["Top", "Right", "Bottom", "Left"] as const;

const VIEWPORT_WIDTH: Record<string, number> = { base: 1280, tablet: 768, mobile: 375 };

/* -------------------------------------------------------------------- panel */

/**
 * The Design tab shown for every widget. Modelled on Figma's right panel:
 * auto layout with a 3x3 alignment pad, Hug / Fill / Fixed sizing, fill,
 * stroke and effects, each editable per device and for the hover state.
 */
export function StylePanel({ value, onChange }: { value?: PbStyle; onChange: (next: PbStyle) => void }) {
  const style: PbStyle = value || {};
  const [scope, setScope] = useState<StyleScope>("base");
  const [linked, setLinked] = useState({ padding: false, margin: false });
  const dispatch = usePuckSelect((s) => s.dispatch);
  const viewports = usePuckSelect((s) => s.appState.ui.viewports);
  const selectedId = usePuckSelect((s) => s.selectedItem?.props.id as string | undefined);

  const map: StyleMap = style[scope] || {};
  const base: StyleMap = style.base || {};
  const get = (prop: string) => map[prop] || "";
  /** What applies on this device when nothing is set here. */
  const inherited = (prop: string) => (scope === "base" ? "" : base[prop] || "");
  const shown = (prop: string) => get(prop) || inherited(prop);

  const patch = (changes: StyleMap) => {
    const next: StyleMap = { ...map };
    for (const [prop, v] of Object.entries(changes)) {
      if (v === "") delete next[prop];
      else next[prop] = v;
    }
    onChange({ ...style, [scope]: next });
  };
  const set = (prop: string, v: string) => patch({ [prop]: v });

  const pickScope = (next: StyleScope) => {
    setScope(next);
    const width = VIEWPORT_WIDTH[next];
    // Show the canvas at the device being edited.
    if (width) dispatch({ type: "setUi", ui: { viewports: { ...viewports, current: { width, height: "auto" } } } });
  };

  const text = (prop: string, placeholder = "") => (
    <input
      className={inputCls}
      value={fromCss(get(prop))}
      placeholder={fromCss(inherited(prop)) || placeholder}
      onChange={(e) => set(prop, toCss(e.target.value))}
    />
  );

  /* ---- auto layout ---- */
  const display = shown("display");
  const direction = shown("flexDirection") || "row";
  const isFlex = display === "flex";
  const isGrid = display === "grid";
  const isColumn = isFlex && direction.startsWith("column");
  const layoutMode = isFlex ? (isColumn ? "flex-col" : "flex-row") : display;

  const setLayout = (mode: string) => {
    if (mode === "flex-row") patch({ display: "flex", flexDirection: "row" });
    else if (mode === "flex-col") patch({ display: "flex", flexDirection: "column" });
    else patch({ display: mode, flexDirection: "" });
  };

  // Which CSS property moves children horizontally / vertically.
  const hProp = isGrid ? "justifyItems" : isColumn ? "alignItems" : "justifyContent";
  const vProp = isColumn ? "justifyContent" : "alignItems";
  const POS = isGrid ? ["start", "center", "end"] : ["flex-start", "center", "flex-end"];
  const spaceBetween = shown("justifyContent") === "space-between";

  const sizeMode = (v: string) => (!v ? "auto" : v === "fit-content" ? "hug" : v === "100%" ? "fill" : "fixed");
  const sizeRow = (label: string, prop: "width" | "height") => {
    const v = get(prop);
    const mode = sizeMode(v);
    return (
      <Row label={label}>
        <Seg
          value={mode}
          onChange={(m) =>
            set(prop, m === "auto" ? "" : m === "hug" ? "fit-content" : m === "fill" ? "100%" : prop === "width" ? "320px" : "200px")
          }
          options={[
            { value: "auto", label: "Auto" },
            { value: "hug", label: "Hug", title: "Hug contents" },
            { value: "fill", label: "Fill", title: "Fill container" },
            { value: "fixed", label: "Fixed" },
          ]}
        />
        {mode === "fixed" && <span className="w-16 shrink-0">{text(prop)}</span>}
      </Row>
    );
  };

  const sides = (kind: "padding" | "margin") => (
    <div className="flex items-center gap-1.5">
      <span className="w-16 shrink-0 text-[11px] capitalize text-gray-500">{kind}</span>
      {linked[kind] ? (
        <input
          className={inputCls}
          value={fromCss(get(`${kind}Top`))}
          placeholder="all sides"
          onChange={(e) => {
            const v = toCss(e.target.value);
            patch(Object.fromEntries(SIDES.map((s) => [`${kind}${s}`, v])));
          }}
        />
      ) : (
        SIDES.map((s) => (
          <input
            key={s}
            title={s}
            className={`${inputCls} px-1 text-center`}
            value={fromCss(get(`${kind}${s}`))}
            placeholder={fromCss(inherited(`${kind}${s}`)) || s[0]}
            onChange={(e) => set(`${kind}${s}`, toCss(e.target.value))}
          />
        ))
      )}
      <button
        type="button"
        title="Same value on all sides"
        onClick={() => setLinked({ ...linked, [kind]: !linked[kind] })}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border ${
          linked[kind] ? "border-[#009691] bg-[#009691]/10 text-[#007f7b]" : "border-gray-300 text-gray-400"
        }`}
      >
        <Link2 className="h-3 w-3" />
      </button>
    </div>
  );

  const css = selectedId ? compileStyle(selectedId, style) : "";
  const scopeCount = Object.keys(map).length;

  return (
    <div className="pb-style-panel -mx-px flex flex-col bg-white text-gray-800">
      {/* Device and state */}
      <div className="flex flex-col gap-2 px-3 py-3">
        <Seg
          value={scope}
          onChange={(v) => pickScope(v as StyleScope)}
          options={[
            { value: "base", label: "Desktop", icon: <Monitor className="h-3 w-3" /> },
            { value: "tablet", label: "Tablet", icon: <Tablet className="h-3 w-3" /> },
            { value: "mobile", label: "Mobile", icon: <Smartphone className="h-3 w-3" /> },
            { value: "hover", label: "Hover", icon: <MousePointer2 className="h-3 w-3" /> },
          ]}
        />
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>
            {scope === "base"
              ? "Applies everywhere unless a device overrides it."
              : scope === "hover"
                ? "Applies while the mouse is over the element."
                : `Overrides Desktop on ${scope} only.`}
          </span>
          {scopeCount > 0 && (
            <button
              type="button"
              onClick={() => onChange({ ...style, [scope]: {} })}
              className="flex shrink-0 items-center gap-1 font-semibold text-gray-500 hover:text-red-600"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {scope === "hover" && (
        <Section title="Hover effect">
          <Seg
            value={get("transform")}
            onChange={(v) => set("transform", v)}
            options={[
              { value: "", label: "None" },
              { value: "translateY(-4px)", label: "Lift" },
              { value: "scale(1.03)", label: "Grow" },
              { value: "scale(0.98)", label: "Press" },
            ]}
          />
        </Section>
      )}

      {scope !== "hover" && (
        <Section title="Auto layout">
          <Seg
            value={layoutMode}
            onChange={setLayout}
            options={[
              { value: "", label: "Default" },
              { value: "flex-row", icon: <ArrowRight className="h-3.5 w-3.5" />, title: "Horizontal (flex row)" },
              { value: "flex-col", icon: <ArrowDown className="h-3.5 w-3.5" />, title: "Vertical (flex column)" },
              { value: "grid", icon: <LayoutGrid className="h-3.5 w-3.5" />, title: "Grid" },
              { value: "block", icon: <Square className="h-3.5 w-3.5" />, title: "Block" },
              { value: "none", icon: <EyeOff className="h-3.5 w-3.5" />, title: "Hidden on this device" },
            ]}
          />
          {(isFlex || isGrid) && (
            <div className="flex gap-3">
              {/* 3x3 alignment pad */}
              <div className="grid h-[72px] w-[72px] shrink-0 grid-cols-3 gap-0.5 rounded-md border border-gray-200 bg-gray-50 p-1">
                {POS.map((v) =>
                  POS.map((h) => {
                    const active = (shown(hProp) || POS[0]) === h && (shown(vProp) || (isGrid ? "start" : "stretch")) === v;
                    return (
                      <button
                        key={`${v}-${h}`}
                        type="button"
                        title={`Align ${v.replace("flex-", "")} / ${h.replace("flex-", "")}`}
                        onClick={() => patch({ [hProp]: h, [vProp]: v })}
                        className="flex items-center justify-center rounded-sm hover:bg-white"
                      >
                        <span className={active ? "h-2.5 w-2.5 rounded-sm bg-[#009691]" : "h-1 w-1 rounded-full bg-gray-400"} />
                      </button>
                    );
                  }),
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Row label="Gap">{text("gap", "0")}</Row>
                {isFlex && (
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      title="Space between"
                      onClick={() => set("justifyContent", spaceBetween ? "" : "space-between")}
                      className={`flex h-7 flex-1 items-center justify-center rounded border ${
                        spaceBetween ? "border-[#009691] bg-[#009691]/10 text-[#007f7b]" : "border-gray-300 text-gray-500"
                      }`}
                    >
                      <AlignHorizontalSpaceBetween className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Wrap onto new lines"
                      onClick={() => set("flexWrap", shown("flexWrap") === "wrap" ? "nowrap" : "wrap")}
                      className={`flex h-7 flex-1 items-center justify-center rounded border ${
                        shown("flexWrap") === "wrap" ? "border-[#009691] bg-[#009691]/10 text-[#007f7b]" : "border-gray-300 text-gray-500"
                      }`}
                    >
                      <WrapText className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Stretch children"
                      onClick={() => set("alignItems", "stretch")}
                      className="h-7 flex-1 rounded border border-gray-300 text-[10px] font-semibold text-gray-500"
                    >
                      Stretch
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {isGrid && (
            <Row label="Columns">
              <Seg
                value={(shown("gridTemplateColumns").match(/repeat\((\d+)/) || [])[1] || ""}
                onChange={(n) => set("gridTemplateColumns", `repeat(${n}, minmax(0, 1fr))`)}
                options={["1", "2", "3", "4", "5", "6"].map((n) => ({ value: n, label: n }))}
              />
            </Row>
          )}
          {isGrid && <Row label="Template">{text("gridTemplateColumns", "e.g. 2fr 1fr")}</Row>}
        </Section>
      )}

      {scope !== "hover" && (
        <Section title="Size">
          {sizeRow("Width", "width")}
          {sizeRow("Height", "height")}
          <Row label="Min / Max W">
            {text("minWidth", "min")}
            {text("maxWidth", "max")}
          </Row>
          <Row label="Min / Max H">
            {text("minHeight", "min")}
            {text("maxHeight", "max")}
          </Row>
        </Section>
      )}

      {scope !== "hover" && (
        <Section title="Spacing">
          {sides("padding")}
          {sides("margin")}
        </Section>
      )}

      <Section title="Fill">
        <Row label="Background">
          <ColorInput value={get("backgroundColor")} placeholder={inherited("backgroundColor")} onChange={(v) => set("backgroundColor", v)} />
        </Row>
        <Row label="Gradient">
          <input
            className={`${inputCls} font-mono`}
            value={get("backgroundImage")}
            placeholder="linear-gradient(135deg, #009691, #0f172a)"
            onChange={(e) => set("backgroundImage", e.target.value)}
          />
        </Row>
        <Row label="Text color">
          <ColorInput value={get("color")} placeholder={inherited("color")} onChange={(v) => set("color", v)} />
        </Row>
      </Section>

      <Section title="Stroke" open={false}>
        <Row label="Border">
          <input
            className={inputCls}
            value={fromCss(get("borderWidth"))}
            placeholder={fromCss(inherited("borderWidth")) || "0"}
            onChange={(e) => {
              const v = toCss(e.target.value);
              patch({ borderWidth: v, borderStyle: v ? get("borderStyle") || "solid" : "" });
            }}
          />
          <select className={inputCls} value={get("borderStyle")} onChange={(e) => set("borderStyle", e.target.value)}>
            {["", "solid", "dashed", "dotted", "double"].map((s) => (
              <option key={s} value={s}>
                {s || "style"}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Color">
          <ColorInput value={get("borderColor")} placeholder={inherited("borderColor")} onChange={(v) => set("borderColor", v)} />
        </Row>
        <Row label="Radius">{text("borderRadius", "0")}</Row>
      </Section>

      <Section title="Effects" open={false}>
        <Seg value={get("boxShadow")} onChange={(v) => set("boxShadow", v)} options={SHADOWS} />
        <Row label="Shadow">
          <input
            className={`${inputCls} font-mono`}
            value={get("boxShadow")}
            placeholder="x y blur spread color"
            onChange={(e) => set("boxShadow", e.target.value)}
          />
        </Row>
        <Row label="Opacity">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={get("opacity") === "" ? 1 : Number(get("opacity"))}
            onChange={(e) => set("opacity", e.target.value === "1" ? "" : e.target.value)}
            className="w-full accent-[#009691]"
          />
          <span className="w-8 shrink-0 text-right text-[10px] text-gray-500">{get("opacity") || "1"}</span>
        </Row>
        <Row label="Blur">
          <input
            className={inputCls}
            value={(get("filter").match(/blur\(([\d.]+)px\)/) || [])[1] || ""}
            placeholder="layer"
            onChange={(e) => set("filter", e.target.value ? `blur(${e.target.value}px)` : "")}
          />
          <input
            className={inputCls}
            value={(get("backdropFilter").match(/blur\(([\d.]+)px\)/) || [])[1] || ""}
            placeholder="background"
            onChange={(e) => set("backdropFilter", e.target.value ? `blur(${e.target.value}px)` : "")}
          />
        </Row>
      </Section>

      {scope !== "hover" && (
        <Section title="Typography" open={false}>
          <Row label="Size">
            {text("fontSize", "inherit")}
            <select className={inputCls} value={get("fontWeight")} onChange={(e) => set("fontWeight", e.target.value)}>
              {["", "300", "400", "500", "600", "700", "800", "900"].map((w) => (
                <option key={w} value={w}>
                  {w || "weight"}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Line / Letter">
            {text("lineHeight", "line")}
            {text("letterSpacing", "letter")}
          </Row>
          <Row label="Align">
            <Seg
              value={get("textAlign")}
              onChange={(v) => set("textAlign", v)}
              options={[
                { value: "", label: "Auto" },
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
            />
          </Row>
        </Section>
      )}

      {scope !== "hover" && (
        <Section title="Position" open={false}>
          <Row label="Position">
            <select className={inputCls} value={get("position")} onChange={(e) => set("position", e.target.value)}>
              {["", "relative", "absolute", "sticky", "fixed"].map((p) => (
                <option key={p} value={p}>
                  {p || "default"}
                </option>
              ))}
            </select>
            {text("zIndex", "z-index")}
          </Row>
          {get("position") && get("position") !== "relative" && (
            <div className="flex items-center gap-1.5">
              <span className="w-16 shrink-0 text-[11px] text-gray-500">Offsets</span>
              {["top", "right", "bottom", "left"].map((side) => (
                <input
                  key={side}
                  title={side}
                  className={`${inputCls} px-1 text-center`}
                  value={fromCss(get(side))}
                  placeholder={side[0].toUpperCase()}
                  onChange={(e) => set(side, toCss(e.target.value))}
                />
              ))}
            </div>
          )}
          <Row label="Overflow">
            <Seg
              value={get("overflow")}
              onChange={(v) => set("overflow", v)}
              options={[
                { value: "", label: "Show" },
                { value: "hidden", label: "Clip" },
                { value: "auto", label: "Scroll" },
              ]}
            />
          </Row>
          <Row label="In parent">
            <select className={inputCls} value={get("alignSelf")} onChange={(e) => set("alignSelf", e.target.value)}>
              {["", "flex-start", "center", "flex-end", "stretch"].map((p) => (
                <option key={p} value={p}>
                  {p ? p.replace("flex-", "") : "align self"}
                </option>
              ))}
            </select>
            {text("flexGrow", "grow")}
            {text("order", "order")}
          </Row>
        </Section>
      )}

      <Section title="Element" open={false}>
        <Row label="HTML tag">
          <select className={inputCls} value={style.tag || "div"} onChange={(e) => onChange({ ...style, tag: e.target.value === "div" ? undefined : e.target.value })}>
            {HTML_TAGS.map((t) => (
              <option key={t} value={t}>
                &lt;{t}&gt;
              </option>
            ))}
          </select>
        </Row>
        <Row label="CSS ID">
          <input className={`${inputCls} font-mono`} value={style.cssId || ""} placeholder="pricing" onChange={(e) => onChange({ ...style, cssId: e.target.value.replace(/[^\w-]/g, "") || undefined })} />
        </Row>
        <Row label="Classes">
          <input className={`${inputCls} font-mono`} value={style.className || ""} placeholder="my-class another" onChange={(e) => onChange({ ...style, className: e.target.value || undefined })} />
        </Row>
      </Section>

      <Section title="Generated CSS" open={false}>
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded bg-slate-900 p-2 font-mono text-[10px] leading-relaxed text-emerald-200">
          {css || "/* Nothing set yet. Every change above becomes CSS here. */"}
        </pre>
      </Section>
    </div>
  );
}
