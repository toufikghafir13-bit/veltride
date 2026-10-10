"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./cart-provider";
import cart from "../lib/cart.cjs";
import { legal, money } from "../lib/catalogue";
import OrderSummary from "./order-summary";
export default function CheckoutView() {
  const { items, ready, storageError } = useCart();
  const [enabled, setEnabled] = useState(false);
  const [checked, setChecked] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/checkout-config", { cache: "no-store", signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(data => setEnabled(data.enabled === true))
      .catch(() => setEnabled(false))
      .finally(() => { if (!controller.signal.aborted) setChecked(true); });
    return () => controller.abort();
  }, []);
  async function pay() {
    if (!enabled || !acknowledged || busy || !items.length) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/create-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cartItems: cart.cleanCart(items) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout could not start.");
      const destination = new URL(data.url);
      if (destination.protocol !== "https:" || destination.hostname !== "checkout.stripe.com") throw new Error("The payment page could not be verified. Please contact support.");
      window.location.assign(destination.href);
    } catch (failure) {
      setError(failure.message || "Checkout could not start. Please try again.");
      setBusy(false);
    }
  }
  const lines = cart.cartLines(items);
  return <section className="container section"><p className="eyebrow">Review your selection</p><h1>Checkout</h1>
    {!ready ? <p>Loading your cart…</p> : lines.length === 0 ? <div className="empty-state"><h2>Your cart is empty</h2><Link className="button" href="/shop">Browse catalogue</Link></div> :
      <div className="checkout-grid"><div className="checkout-details">
        <h2>Research materials</h2>{lines.map(line => <div className="review-line" key={line.slug + ":" + line.size}><div><strong>{line.product.name}</strong><p>{line.size} × {line.quantity}</p></div><span>{money(line.unitCents * line.quantity / 100)} CAD</span></div>)}
        <Link className="text-link" href="/cart">Edit your cart</Link>
        <div className="payment-panel"><h2>Payment</h2>
          <p>{!checked ? "Checking checkout availability…" : enabled ? "Continue to Stripe’s hosted payment page to enter your contact, delivery and payment details." : "Online checkout is currently unavailable. Contact our team for order and availability questions."}</p>
          {!enabled && checked && <a href={"mailto:" + legal.supportEmail}>{legal.supportEmail}</a>}
          <label className="checkbox"><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} /><span>I am at least 18, a qualified researcher, and understand these materials are for laboratory research only. I agree to the <a href="/terms">terms</a> and <a href="/privacy">privacy policy</a>.</span></label>
          <p className="fine-print">{legal.researchDisclaimerShort}</p>
        </div>
      </div><OrderSummary items={items}>
        <button type="button" className="button" disabled={!checked || !enabled || !acknowledged || busy} onClick={pay}>{busy ? "Opening payment page…" : "Continue to secure payment"}</button>
        {error && <p className="message" role="alert">{error}</p>}
        {storageError && <p className="message" role="alert">{storageError}</p>}
      </OrderSummary></div>}
  </section>;
}
