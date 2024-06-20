export function reorderProducts(skuInOrder: string[], products: any[]): any[] {
  // Create a map from the sku to the product for quick lookup
  const productMap = new Map(products.map((product) => [product.sku, product]));

  // Reorder products based on skuInOrder
  const orderedProducts = skuInOrder
    .map((sku) => productMap.get(sku))
    .filter((product) => product !== undefined);

  return orderedProducts;
}
