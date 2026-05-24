const TIKKIE_BASE = 'https://api.abnamro.com/v1/tikkie';

interface TikkieParams {
  amountInCents: number;
  description: string;
  merchantPaymentId: string; // our sessionId — used to match webhook back to session
  apiKey: string;
  appToken: string;
}

interface TikkieResult {
  url: string;
  paymentRequestToken: string;
  demo: boolean;
}

/**
 * Creates a Tikkie payment request.
 * Falls back to demo mode when no credentials are configured.
 */
export async function createTikkiePaymentRequest(
  params: TikkieParams
): Promise<TikkieResult | null> {
  const { amountInCents, description, merchantPaymentId, apiKey, appToken } = params;

  // Demo mode — no real Tikkie credentials
  if (!apiKey || !appToken) {
    const demoToken = `demo_${merchantPaymentId}`;
    return {
      url: `https://tikkie.me/pay/demo/${demoToken}`,
      paymentRequestToken: demoToken,
      demo: true,
    };
  }

  try {
    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const res = await fetch(`${TIKKIE_BASE}/paymentrequests`, {
      method: 'POST',
      headers: {
        'API-Key': apiKey,
        Authorization: `Bearer ${appToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amountInCents,
        description,
        merchantPaymentId,
        expiryDate,
        refundable: false,
      }),
    });

    if (!res.ok) {
      console.error('[Tikkie] API error:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return {
      url: data.url,
      paymentRequestToken: data.paymentRequestToken,
      demo: false,
    };
  } catch (err) {
    console.error('[Tikkie] Request failed:', err);
    return null;
  }
}
