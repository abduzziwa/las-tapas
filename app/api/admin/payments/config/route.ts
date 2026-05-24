import { NextResponse } from 'next/server';
import connectToDatabase from '../../../models/Connection';
import { PaymentConfig } from '../../../models/PaymentConfig';
import { log } from '../../../utils/auditLogger';

// GET /api/admin/payments/config
// Returns the current payment configuration.
// Secret fields are masked if set — the client only knows they're configured, not their value.
export async function GET() {
  try {
    await connectToDatabase();

    let config = await PaymentConfig.findOne({ configId: 'singleton' }).lean() as {
      tikkieApiKey?: string;
      tikkieAppToken?: string;
      iban?: string;
      accountHolder?: string;
      enabledMethods?: string[];
      updatedAt?: Date;
      updatedBy?: string;
    } | null;

    if (!config) {
      config = {
        tikkieApiKey: '',
        tikkieAppToken: '',
        iban: '',
        accountHolder: '',
        enabledMethods: ['pin', 'cash'],
      };
    }

    return NextResponse.json({
      tikkieApiKeySet: !!config.tikkieApiKey,
      tikkieAppTokenSet: !!config.tikkieAppToken,
      iban: config.iban || '',
      accountHolder: config.accountHolder || '',
      enabledMethods: config.enabledMethods || ['pin', 'cash'],
      updatedAt: config.updatedAt || null,
      updatedBy: config.updatedBy || '',
    }, { status: 200 });
  } catch (error) {
    console.error('[PaymentConfig GET] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/payments/config
// Body: { tikkieApiKey?, tikkieAppToken?, iban?, accountHolder?, enabledMethods?, updatedBy }
// Omitting a secret field means "don't change it". Pass empty string to clear it.
export async function PUT(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { tikkieApiKey, tikkieAppToken, iban, accountHolder, enabledMethods, updatedBy } = body;

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: updatedBy || 'admin',
    };

    if (typeof tikkieApiKey === 'string') updateFields.tikkieApiKey = tikkieApiKey.trim();
    if (typeof tikkieAppToken === 'string') updateFields.tikkieAppToken = tikkieAppToken.trim();
    if (typeof iban === 'string') updateFields.iban = iban.trim();
    if (typeof accountHolder === 'string') updateFields.accountHolder = accountHolder.trim();
    if (Array.isArray(enabledMethods)) updateFields.enabledMethods = enabledMethods;

    await PaymentConfig.findOneAndUpdate(
      { configId: 'singleton' },
      { $set: updateFields },
      { upsert: true, new: true }
    );

    log({
      eventType: 'payment.config.updated',
      actor: { type: 'admin', id: String(updatedBy || 'admin') },
      details: { note: `Updated fields: ${Object.keys(updateFields).filter(k => k !== 'updatedAt' && k !== 'updatedBy').join(', ')}` },
    });

    return NextResponse.json({ message: 'Payment config saved' }, { status: 200 });
  } catch (error) {
    console.error('[PaymentConfig PUT] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
