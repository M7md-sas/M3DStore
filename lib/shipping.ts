export const SHIPPING_FLAT = 25;
export const FREE_SHIPPING_OVER = 200;

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
}
