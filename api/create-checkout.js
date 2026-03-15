const Stripe = require("stripe");

module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://veltride.com");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

    if (req.method === "OPTIONS") {
          return res.status(200).end();
    }

    if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
    }

    try {
          const { cartItems } = req.body;

      if (!cartItems || cartItems.length === 0) {
              return res.status(400).json({ error: "Cart is empty" });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const line_items = cartItems.map((item) => ({
              price_data: {
                        currency: "cad",
                        product_data: {
                                    name: item.name,
                                    description:
                                                  item.lotNum && item.lotNum !== "BUNDLE"
                                        ? `${item.dose} · Lot ${item.lotNum} — Research use only. >=98% HPLC purity. COA included.`
                                                    : `${item.dose} — Research use only.`,
                        },
                        unit_amount: Math.round(item.price * 100),
              },
              quantity: item.qty,
      }));

      const session = await stripe.checkout.sessions.create({
              payment_method_types: ["card"],
              line_items,
              mode: "payment",
              success_url: "https://veltride.com/?order=success",
              cancel_url: "https://veltride.com/?order=cancelled",
              shipping_address_collection: {
                        allowed_countries: ["CA"],
              },
              shipping_options: [
                {
                            shipping_rate_data: {
                                          type: "fixed_amount",
                                          fixed_amount: { amount: 1200, currency: "cad" },
                                          display_name: "Standard Shipping (3-7 business days)",
                                          delivery_estimate: {
                                                          minimum: { unit: "business_day", value: 3 },
                                                          maximum: { unit: "business_day", value: 7 },
                                          },
                            },
                },
                {
                            shipping_rate_data: {
                                          type: "fixed_amount",
                                          fixed_amount: { amount: 2200, currency: "cad" },
                                          display_name: "Expedited Shipping (1-2 business days)",
                                          delivery_estimate: {
                                                          minimum: { unit: "business_day", value: 1 },
                                                          maximum: { unit: "business_day", value: 2 },
                                          },
                            },
                },
                      ],
              custom_text: {
                        submit: {
                                    message:
                                                  "For research purposes only. Must be 18+. By completing this order you confirm you are a qualified researcher and agree to our Terms of Service.",
                        },
              },
              metadata: {
                        source: "veltride-shop",
              },
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
          console.error("Stripe error:", err.message);
          return res.status(500).json({ error: err.message });
    }
};
