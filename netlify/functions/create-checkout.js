const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "https://veltride.com",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const { cartItems } = JSON.parse(event.body);
    if (!cartItems || cartItems.length === 0) return { statusCode: 400, headers, body: JSON.stringify({ error: "Cart is empty" }) };

    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: item.name,
          description: `${item.dose}${item.lotNum && item.lotNum !== "BUNDLE" ? " · Lot " + item.lotNum : ""} — Research use only. ≥98% HPLC purity. COA included.`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "https://veltride.com?order=success",
      cancel_url:  "https://veltride.com?order=cancelled",
      shipping_address_collection: { allowed_countries: ["CA"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1200, currency: "cad" },
            display_name: "Standard Shipping (3–7 business days)",
            delivery_estimate: { minimum: { unit: "business_day", value: 3 }, maximum: { unit: "business_day", value: 7 } },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 2200, currency: "cad" },
            display_name: "Expedited Shipping (2 business days)",
            delivery_estimate: { minimum: { unit: "business_day", value: 1 }, maximum: { unit: "business_day", value: 2 } },
          },
        },
      ],
      custom_text: {
        submit: { message: "For research purposes only. Must be 18+. By completing this order you confirm you are a qualified researcher and agree to our Terms of Service." },
      },
      metadata: { source: "veltride-shop" },
    });

    return { statusCode: 200, headers, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error("Stripe error:", err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
