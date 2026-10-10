import source from "../products.js";
import references from "./reference-catalogue.json";
export const { VELTRIDE_PRODUCTS: products, VELTRIDE_SHIPPING: shipping, VELTRIDE_LEGAL: legal } = source;
export const catalogue = references.map(reference => ({ ...reference, product: products.find(p => p.slug === reference.slug) || null }));
export const money = value => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value);
