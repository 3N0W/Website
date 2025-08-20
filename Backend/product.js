// Backend/products.js
export const PRODUCTS = {
  "prod_1": { id: "prod_1", name: "Product 1", amountInINR: 299, file: "product-1.pdf" },
  "prod_2": { id: "prod_2", name: "Product 2", amountInINR: 299, file: "product-2.pdf" }
};

export function getProduct(productId) {
  return PRODUCTS[productId] || null;
}