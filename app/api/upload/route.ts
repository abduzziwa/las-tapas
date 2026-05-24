import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_CATEGORIES = ['food', 'drinks', 'desserts'] as const;
type UploadCategory = (typeof ALLOWED_CATEGORIES)[number];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file     = formData.get('file')     as File | null;
    const category = formData.get('category') as string | null;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: 'Only JPEG, PNG, WebP or GIF images are allowed' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: 'Image too large — maximum 5 MB' }, { status: 400 });
    }

    const folder: UploadCategory =
      ALLOWED_CATEGORIES.includes(category as UploadCategory)
        ? (category as UploadCategory)
        : 'food';

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `${randomUUID()}.${ext}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${folder}/${filename}` }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}
