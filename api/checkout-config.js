const PROMO_END_AT = Date.parse("2026-10-03T22:34:00Z");

module.exports = (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");
  const key = process.env.STRIPE_SECRET_KEY || "";
  const enabled = process.env.STRIPE_CHECKOUT_ENABLED === "true" &&
    ((process.env.VERCEL_ENV === "production" && process.env.STRIPE_LIVE_APPROVED === "true" && key.startsWith("sk_live_")) ||
      (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production" && key.startsWith("sk_test_")));

  const promotion = enabled && Date.now() < PROMO_END_AT
    ? { discountPercent: 20, freeShipping: true, endsAt: "2026-10-03T22:34:00Z" }
    : null;

  return res.status(200).json({ enabled, promotion });
};
