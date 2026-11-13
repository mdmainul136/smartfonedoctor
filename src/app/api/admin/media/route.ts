import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { MediaItem, INITIAL_MEDIA_LIBRARY } from "@/lib/mediaData";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const META_FILE = path.join(UPLOADS_DIR, "manifest.json");

async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch {
    // Already exists
  }
}

async function readManifest(): Promise<MediaItem[]> {
  await ensureUploadsDir();
  try {
    const raw = await fs.readFile(META_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeManifest(items: MediaItem[]) {
  await ensureUploadsDir();
  await fs.writeFile(META_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function GET() {
  try {
    const uploaded = await readManifest();
    // Return custom uploaded items prepended to initial library
    const merged = [...uploaded, ...INITIAL_MEDIA_LIBRARY];
    return NextResponse.json({ success: true, items: merged });
  } catch (error) {
    console.error("Failed to read media library:", error);
    return NextResponse.json({ success: true, items: INITIAL_MEDIA_LIBRARY });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureUploadsDir();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const altText = (formData.get("alt") as string) || "";
    const caption = (formData.get("caption") as string) || "";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const ext = path.extname(file.name) || ".jpg";
    const baseName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);
    const uniqueName = `${Date.now()}-${baseName}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    await fs.writeFile(filePath, buffer);

    const newItem: MediaItem = {
      id: `media-upload-${Date.now()}`,
      filename: uniqueName,
      url: `/uploads/${uniqueName}`,
      alt: altText || baseName.replace(/-/g, " "),
      caption: caption || undefined,
      filesize: buffer.length,
      mimeType: file.type || "image/jpeg",
      createdAt: new Date().toISOString(),
    };

    const current = await readManifest();
    current.unshift(newItem);
    await writeManifest(current);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error("Failed to upload media:", error);
    return NextResponse.json(
      { success: false, error: "File upload failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const filename = searchParams.get("filename");

    if (!id && !filename) {
      return NextResponse.json({ success: false, error: "Missing id or filename" }, { status: 400 });
    }

    const current = await readManifest();
    const itemToDelete = current.find((it) => it.id === id || it.filename === filename);

    if (itemToDelete) {
      const filePath = path.join(UPLOADS_DIR, itemToDelete.filename);
      try {
        await fs.unlink(filePath);
      } catch {
        // File may not exist on disk
      }
      const updated = current.filter((it) => it.id !== itemToDelete.id);
      await writeManifest(updated);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete media item:", error);
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}
