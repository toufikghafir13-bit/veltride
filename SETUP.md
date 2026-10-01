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

1. Sign in to the Stripe account that owns `acct_1T8qyHKxYkJWEy55`. Use **test mode** first. Confirm that the account is allowed to process payments for the exact products being sold.
2. In the Vercel project for this repository, add environment variables for the preview environment (or in Netlify if that is the host you intend to use): `STRIPE_SECRET_KEY` (the account's test secret key), `STORE_ORIGIN` (the full HTTPS URL of the Vercel preview with no trailing slash), `STANDARD_SHIPPING_CENTS` (for example `1200`), and `STRIPE_CHECKOUT_ENABLED=true`. Keep secret keys in Vercel only, never in GitHub or chat.
3. Redeploy the preview on the same host where the variables were added. Add an item to the cart, change its quantity, and complete a Stripe test payment. Confirm the payment, line items, and Canadian shipping address in the Stripe test dashboard. Check the return page and the cancellation path.
4. For production, review product eligibility and Stripe account approval, then set the equivalent production variables in the chosen host with the live secret key and production `STORE_ORIGIN`. Redeploy production only when ready to accept real payments. The checkout endpoint returns an unavailable message if the enable flag or secret key is absent.
5. Configure Stripe receipt emails and internal payment notifications in Stripe. Staff can use the Stripe Dashboard to review paid orders and shipping details; this site does not yet automate fulfillment or inventory deductions.

The customer can use WhatsApp from the cart page if checkout fails or they have a question. Do not ask customers to send payment card details over WhatsApp.
