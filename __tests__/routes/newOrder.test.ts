/**
 * Route tests for POST /api/orders/newOrder
 *
 * Covers: validation, session/table ownership check,
 * orderId generation, audit logging, and success response.
 */

jest.mock("@/app/api/models/Connection", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/app/api/utils/auditLogger", () => ({ log: jest.fn() }));
jest.mock("@/app/api/models/Tables", () => ({
  Tables: { findOne: jest.fn() },
}));

// Mock the Orders constructor + static methods
jest.mock("@/app/api/models/Order", () => {
  const MockOrders = jest.fn().mockImplementation(function (
    this: Record<string, unknown>,
    data: Record<string, unknown>,
  ) {
    Object.assign(this, data);
    this.validate = jest.fn().mockResolvedValue(undefined);
    this.save = jest.fn().mockResolvedValue({ orderId: "0002" });
  });
  (MockOrders as unknown as Record<string, unknown>).findOne = jest.fn();
  return { Orders: MockOrders };
});

import { POST } from "@/app/api/orders/newOrder/route";
import { Tables } from "@/app/api/models/Tables";
import { Orders } from "@/app/api/models/Order";
import { log as auditLog } from "@/app/api/utils/auditLogger";

const mockTablesFind = Tables.findOne as jest.Mock;
const MockOrdersCtor = Orders as unknown as jest.Mock & { findOne: jest.Mock };
const mockAuditLog = auditLog as jest.Mock;

function makeRequest(body: object) {
  return new Request("http://localhost/api/orders/newOrder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_ITEMS = [
  {
    foodId: "F001",
    name: "Patatas Bravas",
    quantity: 2,
    price: 5.5,
    category: "food",
    modification: "",
  },
  {
    foodId: "D001",
    name: "Sangría",
    quantity: 1,
    price: 7.0,
    category: "drink",
    modification: "",
  },
];

describe("POST /api/orders/newOrder", () => {
  beforeEach(() => {
    mockTablesFind.mockReset();
    MockOrdersCtor.findOne.mockReset();
    MockOrdersCtor.mockClear();
    mockAuditLog.mockClear();
    // restore default save mock
    MockOrdersCtor.mockImplementation(function (
      this: Record<string, unknown>,
      data: Record<string, unknown>,
    ) {
      Object.assign(this, data);
      this.validate = jest.fn().mockResolvedValue(undefined);
      this.save = jest.fn().mockResolvedValue({ orderId: "0002" });
    });
  });

  it("returns 400 when sessionId is missing", async () => {
    const res = await POST(
      makeRequest({ tableNumber: "T3", foodItems: VALID_ITEMS }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when tableNumber is missing", async () => {
    const res = await POST(
      makeRequest({ sessionId: "s_123", foodItems: VALID_ITEMS }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when foodItems is not an array", async () => {
    const res = await POST(
      makeRequest({
        sessionId: "s_123",
        tableNumber: "T3",
        foodItems: "invalid",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when a food item is missing required fields", async () => {
    const badItems = [{ foodId: "F001", name: "Test" }]; // missing quantity, price, category
    const res = await POST(
      makeRequest({
        sessionId: "s_123",
        tableNumber: "T3",
        foodItems: badItems,
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 403 when session is not in table.occupiedBy", async () => {
    mockTablesFind.mockResolvedValue(null); // no matching table+session
    const res = await POST(
      makeRequest({
        sessionId: "s_unauth",
        tableNumber: "T3",
        foodItems: VALID_ITEMS,
      }),
    );
    expect(res.status).toBe(403);
  });

  it('creates order with status "ordered" and payment "unpaid"', async () => {
    mockTablesFind.mockResolvedValue({
      tableNumber: "T3",
      occupiedBy: ["s_123"],
    });
    MockOrdersCtor.findOne.mockResolvedValue({ orderId: 1 });

    await POST(
      makeRequest({
        sessionId: "s_123",
        tableNumber: "T3",
        foodItems: VALID_ITEMS,
      }),
    );

    const constructedOrder = MockOrdersCtor.mock.instances[0] as Record<
      string,
      unknown
    >;
    expect(constructedOrder.status).toBe("ordered");
    expect(constructedOrder.payment).toBe("unpaid");
  });

  it("generates orderId as 4-digit padded string", async () => {
    mockTablesFind.mockResolvedValue({
      tableNumber: "T3",
      occupiedBy: ["s_123"],
    });
    MockOrdersCtor.findOne.mockResolvedValue({ orderId: 41 });

    await POST(
      makeRequest({
        sessionId: "s_123",
        tableNumber: "T3",
        foodItems: VALID_ITEMS,
      }),
    );

    const constructedOrder = MockOrdersCtor.mock.instances[0] as Record<
      string,
      unknown
    >;
    expect(constructedOrder.orderId).toBe("0042");
  });

  it('starts orderId at "0001" when no previous orders exist', async () => {
    mockTablesFind.mockResolvedValue({
      tableNumber: "T3",
      occupiedBy: ["s_123"],
    });
    MockOrdersCtor.findOne.mockResolvedValue(null); // no previous orders

    await POST(
      makeRequest({
        sessionId: "s_123",
        tableNumber: "T3",
        foodItems: VALID_ITEMS,
      }),
    );

    const constructedOrder = MockOrdersCtor.mock.instances[0] as Record<
      string,
      unknown
    >;
    expect(constructedOrder.orderId).toBe("0001");
  });

  it("trims and caps guestName at 50 characters", async () => {
    mockTablesFind.mockResolvedValue({
      tableNumber: "T3",
      occupiedBy: ["s_123"],
    });
    MockOrdersCtor.findOne.mockResolvedValue(null);

    const longName = "A".repeat(80);
    await POST(
      makeRequest({
        sessionId: "s_123",
        tableNumber: "T3",
        foodItems: VALID_ITEMS,
        guestName: `  ${longName}  `,
      }),
    );

    const constructedOrder = MockOrdersCtor.mock.instances[0] as Record<
      string,
      unknown
    >;
    expect((constructedOrder.guestName as string).length).toBeLessThanOrEqual(
      50,
    );
    expect((constructedOrder.guestName as string).startsWith(" ")).toBe(false);
  });

  it("calls audit log after successful save", async () => {
    mockTablesFind.mockResolvedValue({
      tableNumber: "T3",
      occupiedBy: ["s_123"],
    });
    MockOrdersCtor.findOne.mockResolvedValue(null);

    await POST(
      makeRequest({
        sessionId: "s_123",
        tableNumber: "T3",
        foodItems: VALID_ITEMS,
        guestName: "Sarah",
      }),
    );

    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "order.created",
        tableNumber: "T3",
      }),
    );
  });

  it("returns 201 with orderId on success", async () => {
    mockTablesFind.mockResolvedValue({
      tableNumber: "T3",
      occupiedBy: ["s_123"],
    });
    MockOrdersCtor.findOne.mockResolvedValue(null);

    const res = await POST(
      makeRequest({
        sessionId: "s_123",
        tableNumber: "T3",
        foodItems: VALID_ITEMS,
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.orderId).toBeDefined();
  });
});
