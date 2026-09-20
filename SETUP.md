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
