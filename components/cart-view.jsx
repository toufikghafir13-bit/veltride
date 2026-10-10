"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart-provider";
import cart from "../lib/cart.cjs";
import { money } from "../lib/catalogue";
import OrderSummary from "./order-summary";
export default function CartView() {
  const { items, ready, quantity, remove, clear, storageError } = useCart();
  const [status, setStatus] = useState("");
  const clearRef = useRef(clear);
  clearRef.current = clear;
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "cancelled") { setStatus("Payment was cancelled. Your cart has been kept."); return; }
    if (params.get("checkout") !== "success") return;
    const session = params.get("session_id");
    if (!session || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(session)) {
      setStatus("We could not verify a completed payment. Your cart has been kept."); return;
    }
    const controller = new AbortController();
    setStatus("Checking your payment status…");
    fetch("/api/checkout-status?session_id=" + encodeURIComponent(session), { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (data.paid === true) {
          clearRef.current();
          setStatus("Payment confirmed. Thank you. Your order confirmation will arrive by email.");
          window.history.replaceState({}, "", "/cart");
        } else setStatus("Payment is not confirmed yet. Your cart has been kept. Contact support if you need help.");
      }).catch(error => { if (error.name !== "AbortError") setStatus("Payment status is unavailable. Your cart has been kept. Please contact support."); });
    return () => controller.abort();
  }, []);
  const lines = cart.cartLines(items);
  return <section className="container section"><p className="eyebrow">Your selection</p><h1>Your cart</h1>
    {status && <p className="message" role="status">{status}</p>}
    {storageError && <p className="message" role="alert">{storageError}</p>}
    {!ready ? <p>Loading your cart…</p> : lines.length === 0 ? <div className="empty-state"><h2>Your cart is empty</h2><p>Browse the catalogue to select research materials.</p><Link className="button" href="/shop">Browse catalogue</Link></div> :
      <div className="checkout-grid"><div className="cart-lines">{lines.map(line => <article className="cart-line" key={line.slug + ":" + line.size}>
        <a href={"/" + line.slug}><Image src={line.product.imagePath} alt={line.product.name + " vial"} width={112} height={112} /></a>
        <div className="line-detail"><h2><a href={"/" + line.slug}>{line.product.name}</a></h2><p>{line.size} · {money(line.unitCents / 100)} CAD each</p>
          <label>Quantity <select aria-label={line.product.name + " " + line.size + " quantity"} value={line.quantity} onChange={event => quantity(line.slug, line.size, Number(event.target.value))}>{Array.from({ length: 10 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label>
          <button className="remove-button" type="button" onClick={() => remove(line.slug, line.size)} aria-label={"Remove " + line.product.name + " " + line.size}>Remove</button>
        </div><strong>{money(line.unitCents * line.quantity / 100)}</strong>
      </article>)}<Link className="text-link" href="/shop">← Continue browsing</Link></div>
      <OrderSummary items={items}><Link className="button" href="/checkout">Review checkout →</Link></OrderSummary></div>}
  </section>;
}
