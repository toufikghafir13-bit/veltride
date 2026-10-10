import "./globals.css";
import { CartProvider } from "../components/cart-provider";
import { Header, Footer } from "../components/site-shell";
export const metadata = {
  metadataBase: new URL("https://veltride.com"),
  title: { default: "VELTRIDE | Canadian Research Catalogue", template: "%s | VELTRIDE" },
  description: "VELTRIDE laboratory research and analytical reference materials. Browse the Canadian catalogue and product documentation.",
};
export default function RootLayout({ children }) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>
    <CartProvider><Header /><main id="main">{children}</main><Footer /></CartProvider>
  </body></html>;
}
