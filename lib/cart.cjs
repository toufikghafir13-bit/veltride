const { VELTRIDE_PRODUCTS: products } = require("../products.js");
const STORAGE_KEY = "veltride_cart_v1";
const MAX_LINES = 20;
const MAX_QUANTITY = 10;
function cleanCart(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const output = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const product = products.find(p => p.slug === item.slug);
    const key = item.slug + ":" + item.size;
    if (!product || product.stockStatus !== "in_stock" || !product.vialSizes.includes(item.size) ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY || seen.has(key)) continue;
    seen.add(key);
    output.push({ slug: item.slug, size: item.size, quantity: item.quantity });
    if (output.length === MAX_LINES) break;
  }
  return output;
}
function cartLines(value) {
  return cleanCart(value).map(item => {
    const product = products.find(p => p.slug === item.slug);
    return { ...item, product, unitCents: Math.round(product.prices[item.size] * 100) };
  });
}
function subtotalCents(value) {
  return cartLines(value).reduce((sum, line) => sum + line.unitCents * line.quantity, 0);
}
function addItem(value, slug, size) {
  const items = cleanCart(value);
  const existing = items.find(item => item.slug === slug && item.size === size);
  if (existing) {
    if (existing.quantity >= MAX_QUANTITY) return { items, error: "Maximum 10 vials per size." };
    return { items: items.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item) };
  }
  if (items.length >= MAX_LINES) return { items, error: "Maximum 20 different cart items." };
  const next = cleanCart([...items, { slug, size, quantity: 1 }]);
  return next.length > items.length ? { items: next } : { items, error: "This item is unavailable." };
}
module.exports = { STORAGE_KEY, MAX_LINES, MAX_QUANTITY, cleanCart, cartLines, subtotalCents, addItem };
