import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrated = new Set(["index.html", "shop.html", "cart.html"]);
const legacy = fs.readdirSync(root).filter(name => name.endsWith(".html") && !migrated.has(name));
const blog = fs.readdirSync(path.join(root, "blog")).filter(name => name.endsWith(".html") && name !== "index.html");
export default {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/shop.html", destination: "/shop", permanent: true },
      { source: "/cart.html", destination: "/cart", permanent: true },
    ];
  },
  async rewrites() {
    return [
      ...legacy.map(name => ({ source: "/" + name.slice(0, -5), destination: "/" + name })),
      { source: "/blog", destination: "/blog/index.html" },
      ...blog.map(name => ({ source: "/blog/" + name.slice(0, -5), destination: "/blog/" + name })),
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ] }];
  },
};
