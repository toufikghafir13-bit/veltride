# VELTRIDE — Setup Checklist

## 🚨 REQUIRED: Activate Stripe Payments

Your checkout is built and ready. To accept real payments, you need to add your Stripe secret key to Vercel.

### Steps:
1. Go to [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret key** (starts with `sk_live_...`)
3. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard) → your `veltride` project
4. Click **Settings** → **Environment Variables**
5. Add: `STRIPE_SECRET_KEY` = your secret key (set for Production + Preview)
6. Click **Save**, then **Redeploy** the latest deployment

Once done, the cart → checkout → Stripe payment flow is live.

---

## ✅ Netlify Forms (Email Capture)

The email capture forms submit to Netlify Forms. To receive notifications:
1. Go to [https://app.netlify.com](https://app.netlify.com) → your site → **Forms**
2. Find `email-signup` and `popup-email`
3. Click **Form notifications** → add your email

---

## ✅ What's Live

| Feature | Status |
|---------|--------|
| Stripe checkout (/api/create-checkout) | ✅ Built — needs STRIPE_SECRET_KEY in Vercel |
| Email capture (Netlify Forms) | ✅ Live — activate notifications in Netlify |
| 10% off popup (first visit) | ✅ Live |
| Free shipping progress bar ($150 threshold) | ✅ Live |
| Urgency/social proof ticker | ✅ Live |
| Product page deep links | ✅ Live |
| Low stock urgency badges | ✅ Live |
| Blog (5 SEO articles) | ✅ Live |
| Sitemap with blog URLs | ✅ Live |
| All 22 product pages with reviews + CTAs | ✅ Live |

---

## 📱 WhatsApp Orders (Backup)

If Stripe isn't set up yet, customers can still order via WhatsApp: **+1 (250) 718-9152**

The checkout error state shows a WhatsApp fallback automatically.
