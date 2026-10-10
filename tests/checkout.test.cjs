const test = require("node:test");
const assert = require("node:assert/strict");
let captured;
class FakeStripe {
  constructor() {
    this.checkout = { sessions: {
      create: async data => { captured = data; return { url: "https://checkout.stripe.com/test-session" }; },
      retrieve: async () => ({ payment_status: "paid", metadata: { source: "veltride-web-store" } }),
    } };
  }
}
// All payment SDK operations in these tests are replaced; no requests or charges occur.
require.cache[require.resolve("stripe")] = { exports: FakeStripe };
const create = require("../pages/api/create-checkout.js");
const config = require("../pages/api/checkout-config.js");
const status = require("../pages/api/checkout-status.js");
function response() {
  return { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}
async function environment(values, action) {
  const names = ["STRIPE_CHECKOUT_ENABLED", "STRIPE_LIVE_APPROVED", "STRIPE_SECRET_KEY", "VERCEL_ENV", "STORE_ORIGIN", "STANDARD_SHIPPING_CENTS"];
  const saved = Object.fromEntries(names.map(name => [name, process.env[name]]));
  for (const name of names) delete process.env[name];
  Object.assign(process.env, values);
  try { await action(); } finally {
    for (const name of names) { if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name]; }
  }
}
test("checkout stays disabled without explicit flags, correct keys and environment", async () => {
  for (const values of [{}, { STRIPE_CHECKOUT_ENABLED: "true", STRIPE_SECRET_KEY: "sk_live_fake", VERCEL_ENV: "production" },
    { STRIPE_CHECKOUT_ENABLED: "true", STRIPE_SECRET_KEY: "sk_live_fake", VERCEL_ENV: "preview" },
    { STRIPE_CHECKOUT_ENABLED: "true", STRIPE_SECRET_KEY: "sk_test_fake" }]) {
    await environment(values, async () => {
      const publicResponse = response(); config({ method: "GET" }, publicResponse);
      assert.equal(Boolean(publicResponse.body.enabled), false);
      assert.equal(publicResponse.headers["Cache-Control"], "no-store");
      const result = response(); await create({ method: "POST", body: { cartItems: [{ slug: "bpc-157", size: "5mg", quantity: 1 }] } }, result);
      assert.equal(result.statusCode, 503);
    });
  }
});
test("server rejects malformed, duplicate and excessive cart items", async () => {
  await environment({ STRIPE_CHECKOUT_ENABLED: "true", STRIPE_SECRET_KEY: "sk_test_fake", VERCEL_ENV: "preview" }, async () => {
    const item = { slug: "bpc-157", size: "5mg", quantity: 1 };
    for (const items of [[], [null], [item, item], [{ ...item, quantity: 11 }], [{ ...item, slug: "not-listed" }]]) {
      const result = response(); await create({ method: "POST", body: { cartItems: items } }, result);
      assert.equal(result.statusCode, 400);
    }
  });
});
test("hosted payment uses source prices, Canadian shipping and existing return URLs", async () => {
  await environment({ STRIPE_CHECKOUT_ENABLED: "true", STRIPE_SECRET_KEY: "sk_test_fake", VERCEL_ENV: "preview", STORE_ORIGIN: "https://veltride.com" }, async () => {
    for (const quantity of [1, 3]) {
      captured = null;
      const result = response(); await create({ method: "POST", body: { cartItems: [{ slug: "bpc-157", size: "5mg", quantity, price: 1 }] } }, result);
      assert.equal(result.statusCode, 200);
      assert.equal(captured.line_items[0].price_data.unit_amount, 6900);
      assert.deepEqual(captured.shipping_address_collection.allowed_countries, ["CA"]);
      assert.equal(captured.shipping_options[0].shipping_rate_data.fixed_amount.amount, quantity === 3 ? 0 : 1200);
      assert.equal(captured.success_url, "https://veltride.com/cart?checkout=success&session_id={CHECKOUT_SESSION_ID}");
    }
  });
});
test("only a valid server-verified session can report paid", async () => {
  await environment({ STRIPE_SECRET_KEY: "sk_test_fake" }, async () => {
    const invalid = response(); await status({ method: "GET", query: { session_id: "spoofed" } }, invalid);
    assert.equal(invalid.statusCode, 400);
    const valid = response(); await status({ method: "GET", query: { session_id: "cs_test_reference" } }, valid);
    assert.equal(valid.body.paid, true);
  });
});
