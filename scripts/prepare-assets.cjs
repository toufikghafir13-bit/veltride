const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "public");
fs.mkdirSync(output, { recursive: true });
const migrated = new Set(["index.html", "shop.html", "cart.html"]);
const allowedScripts = new Set(["products.js", "product-cart.js", "shop-cart.js", "shop-enhance.js"]);
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isFile() || migrated.has(entry.name)) continue;
  if (/\.(html|css|png|ico)$/.test(entry.name) ||
      ["robots.txt", "sitemap.xml"].includes(entry.name) || allowedScripts.has(entry.name)) {
    fs.copyFileSync(path.join(root, entry.name), path.join(output, entry.name));
  }
}
for (const directory of ["images", "blog"]) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), { recursive: true });
}
console.log("Prepared existing catalogue pages and owned assets for Next.js.");
