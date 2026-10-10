"use client";
import Image from "next/image";
import { useState } from "react";
import { money } from "../lib/catalogue";
import { useCart } from "./cart-provider";
export default function ProductCard({ entry }) {
  const product = entry.product;
  const [size, setSize] = useState(product?.vialSizes[0] || "");
  const [message, setMessage] = useState("");
  const { add, ready } = useCart();
  const available = product?.stockStatus === "in_stock";
  return <article className="product-card" data-product={entry.slug}>
    <a href={"/" + entry.slug} className="product-image" aria-label={"View " + entry.name + " details"}>
      <Image src={entry.imagePath} alt={entry.name + " research material vial"} width={500} height={500} sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 23vw" />
    </a>
    <div className="product-body"><p className="eyebrow">{entry.category}</p><h3><a href={"/" + entry.slug}>{entry.name}</a></h3>
      <p className="product-copy">For laboratory research and analytical reference use.</p>
      {product ? <>
        <label className="size-label">Vial size
          <select value={size} onChange={event => { setSize(event.target.value); setMessage(""); }} aria-label={entry.name + " vial size"}>
            {product.vialSizes.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <div className="price-row"><strong>{money(product.prices[size])}</strong><span>CAD</span></div>
        <button type="button" className="button" disabled={!ready || !available} onClick={() => setMessage(add(entry.slug, size) || entry.name + " added to cart.")}>{available ? "Add to cart" : "Unavailable"}</button>
      </> : <><p className="reference-only">Contact us for availability.</p><a className="button secondary" href={"/" + entry.slug}>View details</a></>}
      <p className="card-status" role="status">{message}</p>
    </div>
  </article>;
}
