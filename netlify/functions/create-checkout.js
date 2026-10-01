const Stripe = require("stripe");
const { VELTRIDE_PRODUCTS, VELTRIDE_SHIPPING } = require("../../products.js");

const json = (statusCode, value) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(value),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  if (process.env.STRIPE_CHECKOUT_ENABLED !== "true" || !process.env.STRIPE_SECRET_KEY) {
    return json(503, { error: "Checkout is not available yet. Please contact VELTRIDE." });
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if ((process.env.CONTEXT === "production" && !key.startsWith("sk_live_")) ||
      (process.env.CONTEXT && process.env.CONTEXT !== "production" && !key.startsWith("sk_test_"))) {
    return json(503, { error: "Checkout is not configured for this environment." });
  }

  let cartItems;
  try { cartItems = JSON.parse(event.body || "{}").cartItems; }
  catch { return json(400, { error: "Please review your cart." }); }
  if (!Array.isArray(cartItems) || !cartItems.length || cartItems.length > 20) {
    return json(400, { error: "Please review your cart." });
  }

  const seen = new Set();
  const lineItems = [];
  let subtotalCents = 0;
  for (const item of cartItems) {
    const slug = typeof item?.slug === "string" ? item.slug : "";
    const size = typeof item?.size === "string" ? item.size : "";
    const quantity = item?.quantity;
    const key = `${slug}:${size}`;
    const product = VELTRIDE_PRODUCTS.find(entry => entry.slug === slug);
    if (seen.has(key) || !product || product.stockStatus !== "in_stock" ||
        !product.vialSizes.includes(size) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return json(400, { error: "A cart item is unavailable. Please review your cart." });
    }
    seen.add(key);
    const unitAmount = Math.round(product.prices[size] * 100);
    if (!Number.isSafeInteger(unitAmount) || unitAmount <= 0) {
      return json(503, { error: "Checkout is not available yet. Please contact VELTRIDE." });
    }
    subtotalCents += unitAmount * quantity;
    lineItems.push({
      price_data: { currency: "cad", product_data: { name: `${product.name} ${size}`, description: "For laboratory research use only" }, unit_amount: unitAmount },
      quantity,
    });
  }

  try {
    const origin = process.env.STORE_ORIGIN || "https://veltride.vercel.app";
    const shippingAmount = Number.parseInt(process.env.STANDARD_SHIPPING_CENTS || "1200", 10);
    if (!/^https:\/\/[^/]+$/.test(origin) || !Number.isSafeInteger(shippingAmount) || shippingAmount < 0) {
      throw new Error("Invalid checkout configuration");
    }
    const freeShipping = subtotalCents > VELTRIDE_SHIPPING.freeShippingThreshold * 100;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_creation: "always",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["CA"] },
      shipping_options: [{ shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: freeShipping ? 0 : shippingAmount, currency: "cad" },
        display_name: freeShipping ? "Free standard shipping" : "Standard shipping",
      } }],
      success_url: `${origin}/cart?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?checkout=cancelled`,
      metadata: { source: "veltride-web-store" },
    });
    return json(200, { url: session.url });
  } catch (error) {
    console.error("Checkout session creation failed", error);
    return json(502, { error: "Checkout could not start. Please try again or contact VELTRIDE." });
  }
};

