import { money, shipping } from "../lib/catalogue";
import cart from "../lib/cart.cjs";
export default function OrderSummary({ items, children }) {
  const subtotal = cart.subtotalCents(items) / 100;
  const free = subtotal > shipping.freeShippingThreshold;
  return <aside className="order-summary"><h2>Order summary</h2>
    <div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)} CAD</strong></div>
    <div className="summary-row"><span>Shipping</span><span>{free ? "Free standard shipping" : "Calculated at payment"}</span></div>
    <p className="fine-print">{free ? "Your order qualifies for free standard shipping." : "Free standard shipping on orders over " + money(shipping.freeShippingThreshold) + " CAD."}</p>
    <p className="fine-print">Final charges are shown before payment. Ships within Canada only.</p>
    {children}
  </aside>;
}
