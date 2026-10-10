"use client";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { legal, shipping } from "../lib/catalogue";
export function Header() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return <>
    <div className="notice">{legal.researchDisclaimerShort}</div>
    <header className="header container">
      <Link href="/" className="wordmark" aria-label="VELTRIDE home">VELTRIDE<span>RESEARCH CATALOGUE</span></Link>
      <nav aria-label="Main navigation">
        <Link href="/shop">Catalogue</Link><a href="/quality">Quality</a><a href="/about">About</a><a href="/contact">Contact</a>
        <Link href="/cart" className="cart-link">Cart <span aria-label={count + " items"}>{count}</span></Link>
      </nav>
    </header>
  </>;
}
export function Footer() {
  return <footer className="footer"><div className="container">
    <div className="footer-grid">
      <div><strong className="wordmark">VELTRIDE</strong><p>Laboratory research and analytical reference materials.</p><a href={"mailto:" + legal.supportEmail}>{legal.supportEmail}</a><p>{legal.location}</p></div>
      <div><h2>Explore</h2><Link href="/shop">Catalogue</Link><a href="/quality">Quality documentation</a><a href="/blog">Research articles</a><a href="/contact">Contact</a></div>
      <div><h2>Information</h2><a href="/shipping">Shipping & returns</a><a href="/faq">FAQ</a><a href="/terms">Terms of service</a><a href="/privacy">Privacy policy</a></div>
    </div>
    <p className="fine-print">{shipping.policy}</p>
    <p className="fine-print">{legal.researchDisclaimerFull}</p>
    <p className="copyright">© {legal.copyrightYear} {legal.entityName}</p>
  </div></footer>;
}
