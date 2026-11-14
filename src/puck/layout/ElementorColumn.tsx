import React from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { FieldGroup, FieldTab } from "@puckeditor/core";
import type { ColumnBlockProps } from "@/puck/types";
import { sanitizeSectionId } from "@/puck/components/shared";
import { scopeCustomCss } from "@/lib/cmsCustomCss";
import { createColorField } from "@/puck/fields/ColorPickerField";
import { createCustomCssField } from "@/puck/fields/CustomCssField";
import { createVisibilityField } from "@/puck/fields/VisibilityField";

export const ColumnBlock: ComponentConfig<ColumnBlockProps> = {
  label: "Column",
  defaultProps: {
    label: "Column",
    flexRatio: "1",
    colRatio: "",
    columnWidth: "auto",
    minHeight: "120px",
    paddingY: 16,
    paddingX: 16,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "#e2e8f0",
    borderRadius: "0px",
    customCss: "",
    children: [],
  },
  fields: {
    label: { type: "text", label: "Column Label" },
    flexRatio: {
      type: "select",
      label: "Flex Ratio / Share",
      options: [
        { label: "Equal (1fr / flex: 1)", value: "1" },
        { label: "Double (2fr / flex: 2)", value: "2" },
        { label: "Triple (3fr / flex: 3)", value: "3" },
        { label: "25% Fixed", value: "25%" },
        { label: "33.3% Fixed", value: "33%" },
        { label: "50% Fixed", value: "50%" },
        { label: "66.7% Fixed", value: "67%" },
      ],
    },
    columnWidth: { type: "text", label: "Custom Width (e.g. 100%, 33.3%, auto)" },
    minHeight: { type: "text", label: "Min Height (e.g. 120px, 200px)" },
    paddingY: { type: "number", label: "Padding Y (px)", min: 0, max: 120 },
    paddingX: { type: "number", label: "Padding X (px)", min: 0, max: 120 },
    backgroundColor: createColorField("Background Color"),
    borderWidth: { type: "number", label: "Border Width (px)", min: 0, max: 12 },
    borderStyle: {
      type: "select",
      label: "Border Style",
      options: [
        { label: "None", value: "none" },
        { label: "Solid", value: "solid" },
        { label: "Dashed", value: "dashed" },
        { label: "Dotted", value: "dotted" },
      ],
    },
    borderColor: createColorField("Border Color"),
    borderRadius: { type: "text", label: "Border Radius (e.g. 8px, 12px)" },
    customCss: createCustomCssField(),
    visibility: createVisibilityField(),
    children: { type: "slot", label: "Widgets in Column" },
  },
  renderFields: ({ fields }) => (
    <>
      <FieldTab label="Content">
        {fields.label}
        {fields.children}
      </FieldTab>
      <FieldTab label="Layout">
        <FieldGroup label="Sizing & Flex" defaultExpanded={true}>
          {fields.flexRatio}
          {fields.columnWidth}
          {fields.minHeight}
        </FieldGroup>
      </FieldTab>
      <FieldTab label="Style">
        <FieldGroup label="Spacing" defaultExpanded={true}>
          {fields.paddingY}
          {fields.paddingX}
        </FieldGroup>
        <FieldGroup label="Background & Border" defaultExpanded={true}>
          {fields.backgroundColor}
          {fields.borderWidth}
          {fields.borderStyle}
          {fields.borderColor}
          {fields.borderRadius}
        </FieldGroup>
      </FieldTab>
      <FieldTab label="Advanced">
        {fields.visibility}
        {fields.customCss}
      </FieldTab>
    </>
  ),
  render: ({
    id,
    flexRatio,
    colRatio,
    columnWidth,
    minHeight,
    paddingY,
    paddingX,
    backgroundColor,
    borderWidth,
    borderStyle,
    borderColor,
    borderRadius,
    customCss,
    children: ColumnSlot,
  }) => {
    const safeId = sanitizeSectionId(id, "col");
    const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
    const resolvedMinH = minHeight?.trim() || "120px";

    return (
      <div
        id={`sfd-section-${safeId}`}
        data-col-flex={flexRatio || "1"}
        data-col-ratio={colRatio || ""}
        style={{
          width: columnWidth?.trim() && columnWidth !== "auto" ? columnWidth : "100%",
          minHeight: resolvedMinH,
          backgroundColor: backgroundColor || "transparent",
          paddingTop: `${paddingY ?? 16}px`,
          paddingBottom: `${paddingY ?? 16}px`,
          paddingLeft: `${paddingX ?? 16}px`,
          paddingRight: `${paddingX ?? 16}px`,
          borderWidth: borderWidth ? `${borderWidth}px` : undefined,
          borderStyle: borderStyle && borderStyle !== "none" ? borderStyle : undefined,
          borderColor: borderColor || undefined,
          borderRadius: borderRadius?.trim() || undefined,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
        className="sfd-elementor-column min-w-0"
      >
        {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
        <div className="sfd-column-inner w-full flex-1 flex flex-col">
          <ColumnSlot
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
              flex: "1 1 auto",
              minHeight: "80px",
            }}
          />
        </div>
      </div>
    );
  },
};
