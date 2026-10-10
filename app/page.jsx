export const metadata = { alternates: { canonical: "/" } };
import Image from "next/image";
import Link from "next/link";
import ProductCard from "../components/product-card";
import { catalogue, shipping } from "../lib/catalogue";
export default function Home() {
  const featured = ["semaglutide", "tirzepatide", "retatrutide", "bpc-157"].map(slug => catalogue.find(entry => entry.slug === slug));
  return <>
    <section className="hero container">
      <div className="hero-copy"><p className="eyebrow">Canadian research catalogue</p><h1>Laboratory research.<br /><span>Clearly organized.</span></h1>
        <p className="lead">Explore research compounds, vial specifications and product documentation in one place.</p>
        <div className="actions"><Link className="button" href="/shop">Browse the catalogue <span aria-hidden="true">→</span></Link><a className="text-link" href="/quality">Quality documentation</a></div>
        <p className="hero-note">For qualified researchers aged 18+. Not for human or veterinary use.</p>
      </div>
      <div className="hero-art"><Image src="/images/vials/hero-lab.png" alt="VELTRIDE research catalogue vials" width={1000} height={800} sizes="(max-width: 800px) 100vw, 50vw" priority /></div>
    </section>
    <div className="benefits"><div className="container benefits-grid"><span>Canada-wide shipping</span><span>Free standard shipping over {shipping.freeShippingThreshold} CAD</span><span>Research use only</span></div></div>
    <section className="container section"><div className="section-heading"><div><p className="eyebrow">Explore the catalogue</p><h2>Featured research materials</h2></div><Link className="text-link" href="/shop">View all 22 entries →</Link></div>
      <div className="product-grid">{featured.map(entry => <ProductCard key={entry.slug} entry={entry} />)}</div>
    </section>
    <section className="container documentation"><div><p className="eyebrow">Before you order</p><h2>Review the product.<br />Check the documentation.</h2><p>Read the listed specifications and request batch documentation from our team before placing an order.</p></div><a className="button secondary" href="/quality">Explore quality information →</a></section>
  </>;
}
