"use client";
import { useState } from "react";
import { catalogue } from "../lib/catalogue";
import ProductCard from "./product-card";
export default function CatalogueView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const categories = ["All categories", ...new Set(catalogue.map(entry => entry.category))];
  const visible = catalogue.filter(entry => (category === "All categories" || entry.category === category) && (entry.name + " " + entry.category).toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="container section">
    <p className="eyebrow">Laboratory & analytical reference use</p><h1>Research catalogue</h1>
    <p className="lead narrow">Explore vial specifications and availability. All prices are in Canadian dollars.</p>
    <div className="catalogue-tools"><label>Search catalogue<input type="search" placeholder="Search compounds…" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <label>Research category<select value={category} onChange={event => setCategory(event.target.value)}>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
    </div>
    <p className="results" role="status">{visible.length} catalogue {visible.length === 1 ? "entry" : "entries"}</p>
    <div className="product-grid">{visible.map(entry => <ProductCard key={entry.slug} entry={entry} />)}</div>
    {visible.length === 0 && <div className="empty-state"><h2>No matching entries</h2><p>Try a different compound name or category.</p><button className="button secondary" onClick={() => { setQuery(""); setCategory("All categories"); }}>Clear filters</button></div>}
  </section>;
}
