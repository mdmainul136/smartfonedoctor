import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getCurrentAdminAction } from "@/actions/auth";
import { MediaItem, INITIAL_MEDIA_LIBRARY } from "@/lib/mediaData";

/**
 * Media library API (Admin > Media Library and the page-builder image picker).
 * Admin login required. The list (incl. alt text and captions) is stored in the
 * database (taxonomy_store row "media-library"); uploaded files go to /public/uploads.
 */

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const STORE_ID = "media-library";
const MAX_BYTES = 10 * 1024 * 1024;
// Raster images only: SVG can carry scripts, HTML/JS must never be served from our domain.
const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

const unauthorized = () => NextResponse.json({ success: false, error: "Please sign in to the admin." }, { status: 401 });

async function readLibrary(): Promise<MediaItem[]> {
  const row = await prisma.taxonomyStore.findUnique({ where: { id: STORE_ID } });
  if (row && Array.isArray(row.data)) return row.data as unknown as MediaItem[];
  // First use: start from the files listed in the old manifest (if any) plus the built-in images.
  let uploaded: MediaItem[] = [];
  try {
    uploaded = JSON.parse(await fs.readFile(path.join(UPLOADS_DIR, "manifest.json"), "utf-8"));
  } catch {
    /* no old manifest */
  }
  const items = [...uploaded, ...INITIAL_MEDIA_LIBRARY];
  await writeLibrary(items);
  return items;
}

async function writeLibrary(items: MediaItem[]) {
  await prisma.taxonomyStore.upsert({
    where: { id: STORE_ID },
    update: { data: items as unknown as Prisma.InputJsonValue },
    create: { id: STORE_ID, data: items as unknown as Prisma.InputJsonValue },
  });
}

export async function GET() {
  if (!(await getCurrentAdminAction())) return unauthorized();
  try {
    return NextResponse.json({ success: true, items: await readLibrary() });
  } catch (error) {
    console.error("Failed to read media library:", error);
    return NextResponse.json({ success: false, items: INITIAL_MEDIA_LIBRARY, error: "Could not load the media library" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await getCurrentAdminAction())) return unauthorized();
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const altText = ((formData.get("alt") as string) || "").trim();
    const caption = ((formData.get("caption") as string) || "").trim();
    if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });

    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json(
        { success: false, error: "Only JPEG, PNG, WebP, GIF or AVIF images can be uploaded." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "The image is larger than 10 MB." }, { status: 400 });
    }

    const baseName =
      path
        .basename(file.name, path.extname(file.name))
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "image";
    const uniqueName = `${Date.now()}-${baseName}${ext}`;
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const fileData = new Uint8Array(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOADS_DIR, uniqueName), fileData);

    const newItem: MediaItem = {
      id: `media-upload-${Date.now()}`,
      filename: uniqueName,
      url: `/uploads/${uniqueName}`,
      alt: altText || baseName.replace(/-/g, " "),
      caption: caption || undefined,
      filesize: fileData.byteLength,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
    };
    await writeLibrary([newItem, ...(await readLibrary())]);
    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error("Failed to upload media:", error);
    return NextResponse.json({ success: false, error: "File upload failed" }, { status: 500 });
  }
}

/** Updates an item's alt text and caption. Body: { id, alt, caption }. */
export async function PATCH(req: NextRequest) {
  if (!(await getCurrentAdminAction())) return unauthorized();
  try {
    const { id, alt, caption } = (await req.json()) as { id?: string; alt?: string; caption?: string };
    const items = await readLibrary();
    if (!items.some((it) => it.id === id)) return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 });
    const updated = items.map((it) =>
      it.id === id ? { ...it, alt: (alt ?? it.alt).trim(), caption: caption?.trim() || undefined } : it
    );
    await writeLibrary(updated);
    return NextResponse.json({ success: true, item: updated.find((it) => it.id === id) });
  } catch (error) {
    console.error("Failed to update media item:", error);
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await getCurrentAdminAction())) return unauthorized();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const items = await readLibrary();
    const item = items.find((it) => it.id === id);
    if (!item) return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 });
    // Only uploaded files are deleted from disk; the name comes from our own list, never the request.
    if (item.url.startsWith("/uploads/")) {
      try {
        await fs.unlink(path.join(UPLOADS_DIR, path.basename(item.filename)));
      } catch {
        /* file already gone */
      }
    }
    await writeLibrary(items.filter((it) => it.id !== item.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete media item:", error);
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}
