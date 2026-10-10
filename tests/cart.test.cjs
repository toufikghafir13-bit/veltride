const test = require("node:test");
const assert = require("node:assert/strict");
const cart = require("../lib/cart.cjs");
test("persisted prices are ignored and canonical CAD prices are used", () => {
  const input = [{ slug: "bpc-157", size: "5mg", quantity: 2, price: 1 }];
  assert.equal(cart.subtotalCents(input), 13800);
  assert.deepEqual(cart.cleanCart(input), [{ slug: "bpc-157", size: "5mg", quantity: 2 }]);
});
test("invalid storage entries and duplicate lines cannot reach checkout", () => {
  assert.deepEqual(cart.cleanCart([null, {}, { slug: "unknown", size: "5mg", quantity: 1 },
    { slug: "bpc-157", size: "5mg", quantity: 0 }, { slug: "bpc-157", size: "5mg", quantity: 11 },
    { slug: "bpc-157", size: "invalid", quantity: 1 },
    { slug: "bpc-157", size: "5mg", quantity: 1 },
    { slug: "bpc-157", size: "5mg", quantity: 2 }]), [{ slug: "bpc-157", size: "5mg", quantity: 1 }]);
  assert.deepEqual(cart.cleanCart("bad data"), []);
});
test("add increments one size and enforces quantity limits", () => {
  let items = cart.addItem([], "bpc-157", "5mg").items;
  items = cart.addItem(items, "bpc-157", "5mg").items;
  assert.equal(items[0].quantity, 2);
  assert.equal(cart.addItem([{ ...items[0], quantity: 10 }], "bpc-157", "5mg").error, "Maximum 10 vials per size.");
  assert.ok(cart.addItem([], "aod-9604", "5mg").error);
});
test("cart line limit is enforced without changing an existing cart", () => {
  const { VELTRIDE_PRODUCTS: products } = require("../products.js");
  const all = products.flatMap(product => product.vialSizes.map(size => ({ slug: product.slug, size, quantity: 1 })));
  assert.equal(cart.cleanCart(all).length, 20);
  const extra = all[20];
  assert.ok(cart.addItem(all.slice(0, 20), extra.slug, extra.size).error);
});
