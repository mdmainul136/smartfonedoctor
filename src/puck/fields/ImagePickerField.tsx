"use client";

import { useState } from "react";
import { FieldLabel, type CustomField } from "@puckeditor/core";
import { Image as ImageIcon, FolderOpen, X } from "lucide-react";
import MediaModal from "@/components/admin/MediaModal";

interface ImagePickerControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

function ImagePickerControl({
  label,
  value,
  onChange,
  readOnly,
}: ImagePickerControlProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <FieldLabel label={label} readOnly={readOnly}>
      <div className="flex flex-col gap-2">
        {value ? (
          <div className="relative rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Selected preview"
              className="w-full h-28 object-cover"
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => onChange("")}
                title="Clear image"
                className="absolute top-1.5 right-1.5 rounded-full bg-black/65 p-1 text-white hover:bg-black cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-xs gap-1.5">
            <ImageIcon className="w-4 h-4" />
            <span>No image selected</span>
          </div>
        )}

        <input
          type="text"
          value={value || ""}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or /images/..."
          className="h-8 w-full rounded border border-gray-300 bg-white px-2.5 text-xs text-gray-800 focus:border-[#009691] focus:outline-none"
        />

        {!readOnly && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 h-8 rounded-md border border-[#009691] bg-[#009691]/10 px-3 text-xs font-semibold text-[#007f7b] hover:bg-[#009691]/15 transition cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Choose from Media Library</span>
          </button>
        )}

        <MediaModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialSelectedUrl={value}
          onSelect={(payload) => {
            onChange(payload.url);
            setModalOpen(false);
          }}
        />
      </div>
    </FieldLabel>
  );
}

export function createImagePickerField<T extends string | undefined = string>(
  label = "Image"
): CustomField<T> {
  return {
    type: "custom",
    label,
    render: ({ field, value, onChange, readOnly }) => (
      <ImagePickerControl
        label={field.label || label}
        value={value || ""}
        onChange={(val) => onChange(val as T)}
        readOnly={readOnly}
      />
    ),
  };
}
