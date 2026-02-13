/**
 * @jest-environment node
 */

// Clear Supabase env vars so the API route uses the no-DB path
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SUPABASE_URL: "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
  };
});
afterAll(() => {
  process.env = originalEnv;
});

import { POST } from "@/app/api/bookings/route";

describe("POST /api/bookings", () => {
  it("validates required fields - empty name", async () => {
    const request = new Request("http://localhost/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: "A", email: "test@example.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it("accepts valid booking data", async () => {
    const request = new Request("http://localhost/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "John Doe",
        email: "john@example.com",
        phone: "+213555123456",
        group_size: 2,
        message: "Interested in the desert trip",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it("rejects invalid email", async () => {
    const request = new Request("http://localhost/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "John Doe",
        email: "not-an-email",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("rejects group size above 20", async () => {
    const request = new Request("http://localhost/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "John Doe",
        email: "john@example.com",
        group_size: 25,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
