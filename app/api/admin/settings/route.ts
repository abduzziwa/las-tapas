import { NextResponse } from 'next/server';
import connectToDatabase from '../../models/Connection';
import { SiteSettings } from '../../models/SiteSettings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    // Always upsert-find: create defaults on first access
    const settings = await SiteSettings.findOneAndUpdate(
      { _key: 'main' },
      { $setOnInsert: { _key: 'main' } },
      { upsert: true, new: true }
    );
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[settings GET]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Strip fields that must not be changed via this endpoint
    const { _key, _id, __v, ...update } = body;
    void _key; void _id; void __v;

    const settings = await SiteSettings.findOneAndUpdate(
      { _key: 'main' },
      { $set: { ...update, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[settings PUT]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
