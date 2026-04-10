export const ROLES = {
  ADMIN_BASICO: 'admin_basico',
  SUPER_ADMIN: 'super_admin',
  CUSTOMER: 'customer',
} as const;

export const ORDER_STATUS = {
  PENDIENTE: 'pendiente',
  CONFIRMADO: 'confirmado',
  ENVIADO: 'enviado',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
} as const;

export const INVOICE_STATUS = {
  BORRADOR: 'borrador',
  EMITIDA: 'emitida',
  PAGADA: 'pagada',
  ANULADA: 'anulada',
} as const;

export const WEBHOOK_EVENTS = {
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PROMOTION_CREATED: 'promotion.created',
  PROMOTION_UPDATED: 'promotion.updated',
  LIMITED_EDITION_CREATED: 'limited_edition.created',
  LIMITED_EDITION_UPDATED: 'limited_edition.updated',
  SEASONAL_DISCOUNT_CREATED: 'seasonal_discount.created',
  SEASONAL_DISCOUNT_UPDATED: 'seasonal_discount.updated',
} as const;
