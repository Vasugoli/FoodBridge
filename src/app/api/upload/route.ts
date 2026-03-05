/**
 * Phase 2 – Image Upload API
 *
 * POST /api/upload
 * - Accepts multipart/form-data with a "file" field
 * - Validates type (jpg/png/webp) and size (≤5 MB)
 * - Saves to /public/uploads/ (local dev) or S3 in production
 * - Returns { url, filename, size }
 *
 * In production swap the `saveLocally()` section for an S3/R2 SDK call.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { logAudit, logError } from "@/lib/logger";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only donors may upload donation images
    if (!["donor", "admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Only donors can upload donation images" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, WebP" },
        { status: 400 },
      );
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB" },
        { status: 400 },
      );
    }

    // Build unique filename: <userId>-<timestamp>.<ext>
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const filename = `${session.id}-${Date.now()}.${ext}`;

    // Read file buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await ensureUploadDir();
    await writeFile(join(UPLOAD_DIR, filename), buffer);

    const url = `/uploads/${filename}`;

    logAudit("IMAGE_UPLOAD", session.id, { filename, size: file.size });

    return NextResponse.json({ url, filename, size: file.size });
  } catch (error) {
    logError("Image upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
