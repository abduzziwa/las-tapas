/**
 * Route tests for GET /api/checkout (door scan) and POST /api/checkout (Tikkie initiation)
 */

import { generateCheckoutToken } from "@/app/api/utils/qrToken";

jest.mock("@/app/api/models/Connection", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/app/api/utils/auditLogger", () => ({ log: jest.fn() }));
jest.mock("@/app/api/utils/tikkie", () => ({
  createTikkiePaymentRequest: jest.fn(),
}));
jest.mock("@/app/api/models/session", () => ({
  Session: { findOne: jest.fn() },
}));
jest.mock("@/app/api/models/Tables", () => ({
  Tables: { findOne: jest.fn() },
}));
jest.mock("@/app/api/models/Order", () => ({ Orders: { find: jest.fn() } }));
jest.mock("@/app/api/models/PaymentConfig", () => ({
  PaymentConfig: { findOne: jest.fn() },
}));

import { GET, POST } from "@/app/api/checkout/route";
import { Session } from "@/app/api/models/session";
import { Tables } from "@/app/api/models/Tables";
import { Orders } from "@/app/api/models/Order";
import { PaymentConfig } from "@/app/api/models/PaymentConfig";
import { createTikkiePaymentRequest } from "@/app/api/utils/tikkie";

const mockSessionFindOne = Session.findOne as jest.Mock;
const mockTableFindOne = Tables.findOne as jest.Mock;
const mockOrdersFind = Orders.find as jest.Mock;
const mockConfigFindOne = PaymentConfig.findOne as jest.Mock;
const mockCreateTikkie = createTikkiePaymentRequest as jest.Mock;

// ─── helpers ────────────────────────────────────────────────────────────────

function sessionObj(status = "active") {
  return {
    sessionId: "s_test_001",
    lastActiveTable: "T3",
    status,
    save: jest.fn().mockResolvedValue(undefined),
  };
}

function tableObj(occupiedBy = ["s_test_001", "s_test_002"]) {
  return {
    tableNumber: "T3",
    status: "occupied",
    occupiedBy: [...occupiedBy],
    save: jest.fn().mockResolvedValue(undefined),
  };
}

// ─── GET (door scan) ─────────────────────────────────────────────────────────

describe("GET /api/checkout (door scan)", () => {
  beforeEach(() => {
    mockSessionFindOne.mockReset();
    mockTableFindOne.mockReset();
  });

  it("returns 400 when no token is provided", async () => {
    const res = await GET(new Request("http://localhost/api/checkout"));
    expect(res.status).toBe(400);
  });

  it("returns 403 for a forged / invalid token", async () => {
    const res = await GET(
      new Request("http://localhost/api/checkout?token=invalid.tampered"),
    );
    expect(res.status).toBe(403);
  });

  it("returns 404 when the session does not exist", async () => {
    const token = generateCheckoutToken("s_ghost");
    mockSessionFindOne.mockResolvedValue(null);
    const res = await GET(
      new Request(`http://localhost/api/checkout?token=${token}`),
    );
    expect(res.status).toBe(404);
  });

  it("returns 200 and marks session inactive on valid scan", async () => {
    const token = generateCheckoutToken("s_test_001");
    const session = sessionObj("active");
    const table = tableObj();

    mockSessionFindOne.mockResolvedValue(session);
    mockTableFindOne.mockResolvedValue(table);

    const res = await GET(
      new Request(`http://localhost/api/checkout?token=${token}`),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(session.status).toBe("inactive");
    expect(session.save).toHaveBeenCalled();
    expect(body.sessionId).toBe("s_test_001");
  });

  it("removes only the checked-out session from table.occupiedBy", async () => {
    const token = generateCheckoutToken("s_test_001");
    const session = sessionObj("active");
    const table = tableObj(["s_test_001", "s_test_002"]);

    mockSessionFindOne.mockResolvedValue(session);
    mockTableFindOne.mockResolvedValue(table);

    await GET(new Request(`http://localhost/api/checkout?token=${token}`));

    expect(table.occupiedBy).not.toContain("s_test_001");
    expect(table.occupiedBy).toContain("s_test_002");
  });

  it('sets table status to "available" when the last guest checks out', async () => {
    const token = generateCheckoutToken("s_test_001");
    const session = sessionObj("active");
    const table = tableObj(["s_test_001"]); // only one guest

    mockSessionFindOne.mockResolvedValue(session);
    mockTableFindOne.mockResolvedValue(table);

    const res = await GET(
      new Request(`http://localhost/api/checkout?token=${token}`),
    );
    const body = await res.json();

    expect(table.status).toBe("available");
    expect(body.tableFreed).toBe(true);
  });

  it("does NOT change table status when other guests remain", async () => {
    const token = generateCheckoutToken("s_test_001");
    const session = sessionObj("active");
    const table = tableObj(["s_test_001", "s_test_002", "s_test_003"]);

    mockSessionFindOne.mockResolvedValue(session);
    mockTableFindOne.mockResolvedValue(table);

    const res = await GET(
      new Request(`http://localhost/api/checkout?token=${token}`),
    );
    const body = await res.json();

    expect(table.status).toBe("occupied");
    expect(body.tableFreed).toBe(false);
  });

  it("returns 200 with alreadyDone:true for an already-inactive session", async () => {
    const token = generateCheckoutToken("s_test_001");
    const session = sessionObj("inactive");

    mockSessionFindOne.mockResolvedValue(session);

    const res = await GET(
      new Request(`http://localhost/api/checkout?token=${token}`),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.alreadyDone).toBe(true);
  });
});

// ─── POST (Tikkie initiation) ─────────────────────────────────────────────────

describe("POST /api/checkout (initiate Tikkie)", () => {
  beforeEach(() => {
    mockSessionFindOne.mockReset();
    mockOrdersFind.mockReset();
    mockConfigFindOne.mockReset();
    mockCreateTikkie.mockReset();
  });

  const makePost = (body: object) =>
    new Request("http://localhost/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  it("returns 400 when sessionId is missing", async () => {
    const res = await POST(makePost({}));
    expect(res.status).toBe(400);
  });

  it("returns 404 when session does not exist or is inactive", async () => {
    mockSessionFindOne.mockResolvedValue(null);
    const res = await POST(makePost({ sessionId: "s_ghost" }));
    expect(res.status).toBe(404);
  });

  it("returns 400 when there are no outstanding orders", async () => {
    mockSessionFindOne.mockResolvedValue({
      sessionId: "s_ok",
      lastActiveTable: "T2",
      status: "active",
      guestName: "Ana",
    });
    mockOrdersFind.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
    const res = await POST(makePost({ sessionId: "s_ok" }));
    expect(res.status).toBe(400);
  });

  it("calculates total correctly and passes amountInCents to Tikkie", async () => {
    mockSessionFindOne.mockResolvedValue({
      sessionId: "s_ok",
      lastActiveTable: "T3",
      status: "active",
      guestName: "Sarah",
    });
    mockOrdersFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          foodItems: [
            { price: 9.5, quantity: 1 },
            { price: 5.5, quantity: 2 },
          ],
        },
      ]),
    });
    mockConfigFindOne.mockReturnValue({
      lean: jest
        .fn()
        .mockResolvedValue({ tikkieApiKey: "", tikkieAppToken: "" }),
    });
    mockCreateTikkie.mockResolvedValue({
      url: "https://tikkie.me/demo",
      paymentRequestToken: "tok",
      demo: true,
    });

    await POST(makePost({ sessionId: "s_ok" }));

    // 9.50 + (5.50 * 2) = 20.50 → 2050 cents
    expect(mockCreateTikkie).toHaveBeenCalledWith(
      expect.objectContaining({ amountInCents: 2050 }),
    );
  });

  it("returns Tikkie URL in response body", async () => {
    mockSessionFindOne.mockResolvedValue({
      sessionId: "s_ok",
      lastActiveTable: "T3",
      status: "active",
      guestName: "Sarah",
    });
    mockOrdersFind.mockReturnValue({
      lean: jest
        .fn()
        .mockResolvedValue([{ foodItems: [{ price: 10, quantity: 1 }] }]),
    });
    mockConfigFindOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    mockCreateTikkie.mockResolvedValue({
      url: "https://tikkie.me/demo/tok123",
      paymentRequestToken: "tok123",
      demo: true,
    });

    const res = await POST(makePost({ sessionId: "s_ok" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe("https://tikkie.me/demo/tok123");
    expect(body.demo).toBe(true);
  });

  it("returns 502 when createTikkiePaymentRequest returns null", async () => {
    mockSessionFindOne.mockResolvedValue({
      sessionId: "s_ok",
      lastActiveTable: "T3",
      status: "active",
      guestName: "",
    });
    mockOrdersFind.mockReturnValue({
      lean: jest
        .fn()
        .mockResolvedValue([{ foodItems: [{ price: 5, quantity: 1 }] }]),
    });
    mockConfigFindOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    mockCreateTikkie.mockResolvedValue(null);

    const res = await POST(makePost({ sessionId: "s_ok" }));
    expect(res.status).toBe(502);
  });
});
