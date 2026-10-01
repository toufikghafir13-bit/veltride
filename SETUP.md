# VELTRIDE — Setup Checklist

## Current storefront status

Live checkout should remain disabled until payment processing and legal/compliance requirements have been reviewed and approved.

### Ordering flow currently shown on the site
1. Customer browses the research catalogue.
2. Customer contacts VELTRIDE by WhatsApp or email.
3. Research-use requirements and order details are reviewed.
4. Payment instructions are provided only after review.

---

## Shipping settings

- Free standard shipping threshold: **$150 CAD**
- Same-business-day dispatch cutoff: **1:00 PM PT, Monday–Friday**
- Orders after the cutoff ship the next business day.
- Canada-only shipping unless the public shipping policy is updated.

---

## Vercel

This repository includes `vercel.json` and is designed for Vercel deployment.

Before enabling any live checkout flow:
- Confirm the production Vercel project and domain.
- Confirm all required environment variables.
- Review payment-provider terms and applicable legal/compliance requirements.
- Test checkout only in a preview or test environment first.

Do not commit secret API keys to this repository.

---

## Site consistency checks

Before each production release, verify:
- Homepage and catalogue prices match.
- Shipping threshold and dispatch cutoff match across Home, FAQ, Shipping, Terms, and product pages.
- Age/research-use language is consistent.
- Purity claims match current batch documentation.
- Product images are served from VELTRIDE-owned assets or an approved source.
- Contact email and WhatsApp details are correct.

## Cart and Stripe Checkout setup

The draft storefront now contains a cart and a server-side Checkout Session endpoint. Only products with prices in `products.js` can be added to the cart. Stripe never receives a price supplied by the shopper's browser; the server looks up each product, vial size, and CAD price again.

1. Sign in to the Stripe account intended for live VELTRIDE payments and verify its account ID. The account currently in onboarding is `acct_1T8qy63SMWgaF3zu`, which differs from the earlier test-dashboard account `acct_1T8qyHKxYkJWEy55`. Use test and live keys from the **same approved account**. Confirm in writing that Stripe supports the exact products and research-buyer safeguards before enabling live payments.
2. In the Vercel project for this repository, add environment variables for the preview environment (or in Netlify if that is the host you intend to use): `STRIPE_SECRET_KEY` (the account's test secret key), `STORE_ORIGIN` (the full HTTPS URL of the Vercel preview with no trailing slash), `STANDARD_SHIPPING_CENTS` (for example `1200`), and `STRIPE_CHECKOUT_ENABLED=true`. Keep secret keys in Vercel only, never in GitHub or chat.
3. Redeploy the preview on the same host where the variables were added. Add an item to the cart, change its quantity, and complete a Stripe test payment. Confirm the payment, line items, and Canadian shipping address in the Stripe test dashboard. Check the return page and the cancellation path.
4. For production, review product eligibility and Stripe account approval, then set the equivalent production variables in the chosen host with the live secret key, production `STORE_ORIGIN=https://www.veltride.com`, and `STRIPE_LIVE_APPROVED=true`. Redeploy production only when ready to accept real payments. The checkout endpoint returns an unavailable message if the enable flag or secret key is absent.
5. Configure Stripe receipt emails and internal payment notifications in Stripe. Staff can use the Stripe Dashboard to review paid orders and shipping details; this site does not yet automate fulfillment or inventory deductions.

The customer enters a Canada-only shipping address on Stripe Checkout **before payment**. Checkout collects only the payment and shipping details Stripe requires; the cart does not request a separate billing address or phone number. The Stripe order record contains the shipping details for fulfillment.

Keep `STRIPE_CHECKOUT_ENABLED` and `STRIPE_LIVE_APPROVED` unset or `false` in production until Stripe approves the actual catalog, the payout account is connected directly in Stripe, tax and shipping obligations are reviewed, live keys are configured, and an end-to-end test succeeds. When disabled, the cart continues to offer a clearly labelled WhatsApp **order request**, not a paid checkout. Contact remains available for help. Never ask customers to send card details over WhatsApp.
