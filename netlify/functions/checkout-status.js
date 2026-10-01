const Stripe = require("stripe");

const json = (statusCode, value) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(value),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  const sessionId = event.queryStringParameters?.session_id;
  if (typeof sessionId !== "string" || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return json(400, { error: "Invalid session" });
  }
  if (!process.env.STRIPE_SECRET_KEY) return json(503, { error: "Payment status unavailable" });
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return json(200, { paid: session.payment_status === "paid" && session.metadata?.source === "veltride-web-store" });
  } catch (error) {
    console.error("Checkout status lookup failed", error);
    return json(404, { error: "Payment status unavailable" });
  }
};

