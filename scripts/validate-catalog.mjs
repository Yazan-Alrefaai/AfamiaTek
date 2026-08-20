import { readFile, stat } from "node:fs/promises";

const workspaceUrl = new URL("../", import.meta.url);
const catalogUrl = new URL("src/data/products.json", workspaceUrl);
const imagePathPattern = /^\/products\/[a-z0-9/_-]+\.(?:avif|jpe?g|png|webp)$/i;

const products = JSON.parse(await readFile(catalogUrl, "utf8"));

if (!Array.isArray(products)) {
  throw new Error("src/data/products.json must contain an array.");
}

/** Fails the build with a message naming the product and the missing file. */
async function requireFile(imagePath, slug, what) {
  const publicFileUrl = new URL(`public${imagePath}`, workspaceUrl);
  let file;
  try {
    file = await stat(publicFileUrl);
  } catch {
    throw new Error(`${slug} is missing its ${what}: ${imagePath}`);
  }

  if (!file.isFile()) {
    throw new Error(`${slug} ${what} is not a file: ${imagePath}`);
  }
}

for (const product of products) {
  const slug = product?.slug ?? "Unknown product";

  // every product needs a link-preview card — WhatsApp is the order channel
  await requireFile(`/products/og/${slug}.png`, slug, "social card");

  if (product?.images === undefined) continue;

  if (!Array.isArray(product.images) || product.images.length === 0) {
    throw new Error(`${slug} has invalid images.`);
  }

  for (const imagePath of product.images) {
    if (typeof imagePath !== "string" || !imagePathPattern.test(imagePath)) {
      throw new Error(`${slug} has an invalid image path: ${imagePath}`);
    }

    await requireFile(imagePath, slug, "product render");
  }
}

console.log(`Catalog asset check passed for ${products.length} products.`);
