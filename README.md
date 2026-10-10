# VELTRIDE storefront

Next.js powers the homepage, searchable catalogue, shared cart and checkout review. Existing product, policy and research article pages remain available at their original clean URLs and HTML URLs. The site uses VELTRIDE's own images and copy.

## Run locally

Use Node.js 22 or 24.

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` only if configuration is needed. Do not place payment secrets in public variables or commit them. Default checkout is disabled.

```sh
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

Browser checks start a production Next.js server with payments disabled. Payment unit tests stub the SDK; no charges are made. GitHub Actions runs both suites and the production build.

## Catalogue and compatibility

- `products.js` remains the source of prices, vial sizes, stock, shipping policy and business details.
- `lib/reference-catalogue.json` preserves all 22 existing catalogue entries. Entries without approved price data offer a product details link.
- `scripts/prepare-assets.cjs` copies only existing public HTML, CSS, image and approved browser-script assets into a generated `public/` directory before development or build. It does not publish source, API code, configuration or environment files.
- Clean product/policy/blog links are rewritten to the preserved HTML pages. Home/shop/cart HTML links redirect to the Next.js pages, retaining query parameters.
- The cart still uses `veltride_cart_v1` so existing product-page add-to-cart controls continue to work.
- Root `api/` handlers moved to `pages/api/`. Endpoints retain the same URLs and server-side price checks. Session creation now also requires an explicit hosting environment, matching the existing checkout availability check.

## Deploy and payments

The included Vercel configuration selects Next.js and `npm run build`. Preview branches can be reviewed before merging. Netlify detects Next.js through its supported adapter; the old standalone-function redirect is removed.

The repository's existing payment integration is Stripe, not a verified match for Eppix's unnamed processor. Next.js does not itself provide card acceptance. No Interac destination, discount or new payment provider is invented by this migration.

Live checkout stays gated by `STRIPE_CHECKOUT_ENABLED=true`, a production `VERCEL_ENV`, `STRIPE_LIVE_APPROVED=true` and a live Stripe key. Preview environments require a test key. Keep the flags false until the existing requirements in [SETUP.md](SETUP.md) are met, including processor approval for the actual catalogue.

Set `STORE_ORIGIN` to the deployment's HTTPS origin when running approved payment tests, so return links do not leave the preview. `STANDARD_SHIPPING_CENTS` remains server configuration (default 1200). Free shipping uses the existing policy: subtotal strictly over CAD150. The storefront does not invent tax rates or claim final charges before the hosted payment page.

This migration does not add automated fulfillment, inventory reservation, payment webhooks, refunds, or tax registration/configuration. Those existing launch tasks remain necessary before accepting customer payments. Card/wallet availability and fees are determined by the approved payment account.

This branch does not merge or replace the live storefront automatically.
