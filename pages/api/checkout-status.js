const Stripe = require("stripe");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const sessionId = req.query && req.query.session_id;
  if (typeof sessionId !== "string" || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return res.status(400).json({ error: "Invalid session" });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "Payment status unavailable" });
  }
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return res.status(200).json({ paid: session.payment_status === "paid" && session.metadata?.source === "veltride-web-store" });
  } catch (error) {
    console.error("Checkout status lookup failed", error);
    return res.status(404).json({ error: "Payment status unavailable" });
  }
};

