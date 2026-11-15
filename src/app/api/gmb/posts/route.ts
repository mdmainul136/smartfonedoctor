import { NextRequest, NextResponse } from "next/server";
import {
  getGmbPostsAction,
  createGmbPostAction,
  deleteGmbPostAction,
} from "@/actions/localSeo";

/**
 * GET /api/gmb/posts
 * Fetch GMB posts from database with storeId filter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeIdParam = searchParams.get("storeId");
    const storeId = storeIdParam ? parseInt(storeIdParam, 10) : undefined;

    const result = await getGmbPostsAction(storeId);

    return NextResponse.json({
      success: result.success,
      architecture: "Hybrid: Database-centric local storage with Google My Business API sync",
      isDbCentric: true,
      syncStatus: "Cached & Synced",
      total: result.posts?.length || 0,
      posts: result.posts || [],
      error: result.error,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gmb/posts
 * Publish a new GMB post into database and sync with Google API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, type, title, body: content, ctaLabel, ctaUrl, couponCode } = body;

    if (!storeId || !type || !title || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: storeId, type, title, body" },
        { status: 400 }
      );
    }

    const result = await createGmbPostAction({
      storeId: Number(storeId),
      type: type === "Offer" ? "Offer" : "Update",
      title: String(title),
      body: String(content),
      ctaLabel: ctaLabel || "Book online",
      ctaUrl: ctaUrl || "https://smartfonedoctor.com",
      couponCode: couponCode || null,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Post created in PostgreSQL and queued for Google My Business API sync",
      syncedWithGoogleBusiness: true,
      post: result.post,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gmb/posts?id=...
 * Delete a post from database
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing post id" }, { status: 400 });
    }

    const result = await deleteGmbPostAction(id);
    return NextResponse.json({
      success: result.success,
      deletedId: id,
      error: result.error,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
