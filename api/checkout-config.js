module.exports = (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");
  const key = process.env.STRIPE_SECRET_KEY || "";
  const enabled = process.env.STRIPE_CHECKOUT_ENABLED === "true" &&
    ((process.env.VERCEL_ENV === "production" && key.startsWith("sk_live_")) ||
      (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production" && key.startsWith("sk_test_")));

  return res.status(200).json({ enabled });
};
