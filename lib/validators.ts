export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null) return value as Record<string, unknown>;
  return {};
}

export function validateRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

export function validatePrice(price: number): boolean {
  return typeof price === 'number' && price >= 0;
}

export function validateStock(stock: number): boolean {
  return Number.isInteger(stock) && stock >= 0;
}

export function validateSlug(slug: string): boolean {
  const re = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return re.test(slug);
}

export function validateProduct(data: unknown) {
  const errors: Record<string, string> = {};
  const payload = asRecord(data);

  if (!validateRequired(payload.name)) errors.name = 'El nombre es requerido';
  if (!validateRequired(payload.category_id)) errors.category_id = 'La categoría es requerida';
  if (!validatePrice(Number(payload.price))) errors.price = 'El precio debe ser un número positivo';
  if (!validateStock(Number(payload.stock))) errors.stock = 'El stock debe ser un número entero positivo';
  if (!validateRequired(payload.sku)) errors.sku = 'El SKU es requerido';
  
  if (typeof payload.slug === 'string' && payload.slug && !validateSlug(payload.slug)) {
    errors.slug = 'El slug debe tener un formato válido (minúsculas, números y guiones)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateInvoicePayload(data: unknown) {
  const errors: Record<string, string> = {};
  const payload = asRecord(data);

  if (!validateRequired(payload.sale_id)) errors.sale_id = 'sale_id es requerido';
  if (payload.customer_tax_id !== undefined && payload.customer_tax_id !== null && typeof payload.customer_tax_id !== 'string') {
    errors.customer_tax_id = 'customer_tax_id debe ser texto';
  }
  if (payload.customer_address !== undefined && payload.customer_address !== null && typeof payload.customer_address !== 'string') {
    errors.customer_address = 'customer_address debe ser texto';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validatePromotionPayload(data: unknown, options?: { partial?: boolean }) {
  const errors: Record<string, string> = {};
  const partial = options?.partial ?? false;
  const payload = asRecord(data);

  if (!partial && !validateRequired(payload.product_id)) errors.product_id = 'product_id es requerido';
  if (!partial && !validateRequired(payload.title)) errors.title = 'title es requerido';
  if (!partial && !validateRequired(payload.start_date)) errors.start_date = 'start_date es requerido';
  if (!partial && !validateRequired(payload.end_date)) errors.end_date = 'end_date es requerido';

  if (payload.product_id !== undefined && !validateRequired(payload.product_id)) errors.product_id = 'product_id es requerido';
  if (payload.title !== undefined && !validateRequired(payload.title)) errors.title = 'title es requerido';
  if (payload.start_date !== undefined && !validateRequired(payload.start_date)) errors.start_date = 'start_date es requerido';
  if (payload.end_date !== undefined && !validateRequired(payload.end_date)) errors.end_date = 'end_date es requerido';

  if (payload.discount_percent !== undefined && !validatePrice(Number(payload.discount_percent))) {
    errors.discount_percent = 'discount_percent debe ser número >= 0';
  }
  if (payload.discount_amount !== undefined && !validatePrice(Number(payload.discount_amount))) {
    errors.discount_amount = 'discount_amount debe ser número >= 0';
  }
  if (!partial && payload.discount_percent === undefined && payload.discount_amount === undefined) {
    errors.discount = 'Debe enviar discount_percent o discount_amount';
  }
  if (payload.is_active !== undefined && typeof payload.is_active !== 'boolean') {
    errors.is_active = 'is_active debe ser boolean';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSeasonalDiscountPayload(data: unknown, options?: { partial?: boolean }) {
  const errors: Record<string, string> = {};
  const partial = options?.partial ?? false;
  const payload = asRecord(data);

  if (!partial && !validateRequired(payload.product_id)) errors.product_id = 'product_id es requerido';
  if (!partial && !validateRequired(payload.title)) errors.title = 'title es requerido';
  if (!partial && !validateRequired(payload.season)) errors.season = 'season es requerido';
  if (!partial && !validateRequired(payload.discount_percent)) errors.discount_percent = 'discount_percent es requerido';
  if (!partial && !validateRequired(payload.start_date)) errors.start_date = 'start_date es requerido';
  if (!partial && !validateRequired(payload.end_date)) errors.end_date = 'end_date es requerido';

  if (payload.discount_percent !== undefined && !validatePrice(Number(payload.discount_percent))) {
    errors.discount_percent = 'discount_percent debe ser número >= 0';
  }
  if (payload.is_active !== undefined && typeof payload.is_active !== 'boolean') {
    errors.is_active = 'is_active debe ser boolean';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLimitedEditionPayload(data: unknown, options?: { partial?: boolean }) {
  const errors: Record<string, string> = {};
  const partial = options?.partial ?? false;
  const payload = asRecord(data);

  if (!partial && !validateRequired(payload.product_id)) errors.product_id = 'product_id es requerido';
  if (!partial && !validateRequired(payload.title)) errors.title = 'title es requerido';
  if (!partial && !validateRequired(payload.release_date)) errors.release_date = 'release_date es requerido';
  if (!partial && payload.total_units === undefined) errors.total_units = 'total_units es requerido';

  if (payload.total_units !== undefined && (!Number.isInteger(payload.total_units) || Number(payload.total_units) <= 0)) {
    errors.total_units = 'total_units debe ser entero > 0';
  }
  if (payload.remaining_units !== undefined && (!Number.isInteger(payload.remaining_units) || Number(payload.remaining_units) < 0)) {
    errors.remaining_units = 'remaining_units debe ser entero >= 0';
  }
  if (payload.is_active !== undefined && typeof payload.is_active !== 'boolean') {
    errors.is_active = 'is_active debe ser boolean';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateStockReorderPayload(data: unknown) {
  const errors: Record<string, string> = {};
  const payload = asRecord(data);

  if (!Array.isArray(payload.productIds) || payload.productIds.length === 0) {
    errors.productIds = 'productIds debe ser un array no vacío';
  } else if (!payload.productIds.every((id: unknown) => typeof id === 'string' && id.length > 0)) {
    errors.productIds = 'productIds debe contener IDs válidos';
  }

  if (payload.reorderQuantity !== undefined && (!Number.isInteger(payload.reorderQuantity) || Number(payload.reorderQuantity) <= 0)) {
    errors.reorderQuantity = 'reorderQuantity debe ser entero > 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCustomerPayload(data: unknown) {
  const errors: Record<string, string> = {};
  const payload = asRecord(data);

  if (!validateRequired(payload.name)) errors.name = 'El nombre es requerido';
  if (payload.email !== undefined && payload.email !== null && !validateEmail(String(payload.email))) {
    errors.email = 'El email no tiene un formato válido';
  }
  if (payload.phone !== undefined && payload.phone !== null && typeof payload.phone !== 'string') {
    errors.phone = 'El teléfono debe ser texto';
  }
  if (payload.dni !== undefined && payload.dni !== null && typeof payload.dni !== 'string') {
    errors.dni = 'El DNI debe ser texto';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateOrderPayload(data: unknown) {
  const errors: Record<string, string> = {};
  const validStatuses = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
  const payload = asRecord(data);

  if (!validateRequired(payload.customer_name)) errors.customer_name = 'El nombre del cliente es requerido';
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.items = 'items debe ser un array no vacío';
  } else {
    for (const [index, item] of payload.items.entries()) {
      const line = asRecord(item);

      if (!validateRequired(line.product_id)) {
        errors[`items.${index}.product_id`] = 'product_id es requerido';
      }
      if (!Number.isInteger(line.quantity) || Number(line.quantity) <= 0) {
        errors[`items.${index}.quantity`] = 'quantity debe ser entero > 0';
      }
      if (!validatePrice(Number(line.unit_price))) {
        errors[`items.${index}.unit_price`] = 'unit_price debe ser número >= 0';
      }
    }
  }

  if (payload.customer_email !== undefined && payload.customer_email !== null && !validateEmail(String(payload.customer_email))) {
    errors.customer_email = 'El email no tiene un formato válido';
  }
  if (payload.status !== undefined && (typeof payload.status !== 'string' || !validStatuses.includes(payload.status))) {
    errors.status = 'status inválido';
  }
  if (payload.total !== undefined && !validatePrice(Number(payload.total))) {
    errors.total = 'total debe ser número >= 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSalePayload(data: unknown) {
  const errors: Record<string, string> = {};
  const payload = asRecord(data);

  if (!validateRequired(payload.customer_name)) errors.customer_name = 'El nombre del cliente es requerido';
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.items = 'items debe ser un array no vacío';
  } else {
    for (const [index, item] of payload.items.entries()) {
      const line = asRecord(item);

      if (!validateRequired(line.product_id)) {
        errors[`items.${index}.product_id`] = 'product_id es requerido';
      }
      if (!Number.isInteger(line.quantity) || Number(line.quantity) <= 0) {
        errors[`items.${index}.quantity`] = 'quantity debe ser entero > 0';
      }
      if (!validatePrice(Number(line.unit_price))) {
        errors[`items.${index}.unit_price`] = 'unit_price debe ser número >= 0';
      }
    }
  }

  if (payload.total !== undefined && !validatePrice(Number(payload.total))) {
    errors.total = 'total debe ser número >= 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRolePayload(data: unknown, options?: { partial?: boolean }) {
  const errors: Record<string, string> = {};
  const partial = options?.partial ?? false;
  const payload = asRecord(data);

  if (!partial && !validateRequired(payload.name)) errors.name = 'El nombre es requerido';
  if (payload.name !== undefined && !validateRequired(payload.name)) errors.name = 'El nombre es requerido';
  if (payload.description !== undefined && typeof payload.description !== 'string') {
    errors.description = 'La descripción debe ser texto';
  }
  if (payload.permissions !== undefined) {
    if (!Array.isArray(payload.permissions) || !payload.permissions.every((p: unknown) => typeof p === 'string')) {
      errors.permissions = 'permissions debe ser un array de strings';
    }
  }
  if (payload.is_system !== undefined && typeof payload.is_system !== 'boolean') {
    errors.is_system = 'is_system debe ser boolean';
  }
  if (payload.is_active !== undefined && typeof payload.is_active !== 'boolean') {
    errors.is_active = 'is_active debe ser boolean';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateWebhookPayload(data: unknown, options?: { partial?: boolean }) {
  const errors: Record<string, string> = {};
  const partial = options?.partial ?? false;
  const payload = asRecord(data);

  if (!partial && !validateRequired(payload.name)) errors.name = 'El nombre es requerido';
  if (!partial && !validateRequired(payload.url)) errors.url = 'La URL es requerida';
  if (!partial && !validateRequired(payload.event)) errors.event = 'El evento es requerido';

  if (payload.name !== undefined && !validateRequired(payload.name)) errors.name = 'El nombre es requerido';
  if (payload.url !== undefined && !validateRequired(payload.url)) errors.url = 'La URL es requerida';
  if (payload.event !== undefined && !validateRequired(payload.event)) errors.event = 'El evento es requerido';

  if (payload.method !== undefined && (typeof payload.method !== 'string' || !['POST', 'GET'].includes(payload.method))) {
    errors.method = 'method debe ser POST o GET';
  }

  if (payload.headers !== undefined) {
    const isObject = typeof payload.headers === 'object' && payload.headers !== null && !Array.isArray(payload.headers);
    if (!isObject) {
      errors.headers = 'headers debe ser un objeto key/value';
    }
  }

  if (payload.retry_count !== undefined && (!Number.isInteger(payload.retry_count) || Number(payload.retry_count) < 0)) {
    errors.retry_count = 'retry_count debe ser un entero >= 0';
  }

  if (payload.timeout !== undefined && (!Number.isInteger(payload.timeout) || Number(payload.timeout) <= 0)) {
    errors.timeout = 'timeout debe ser un entero > 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateUserUpdatePayload(data: unknown) {
  const errors: Record<string, string> = {};
  const allowedRoles = ['customer', 'admin_basico', 'super_admin'];
  const payload = asRecord(data);

  if (payload.full_name !== undefined && !validateRequired(payload.full_name)) {
    errors.full_name = 'full_name no puede estar vacío';
  }

  if (payload.role !== undefined && (typeof payload.role !== 'string' || !allowedRoles.includes(payload.role))) {
    errors.role = 'role inválido';
  }

  if (payload.is_active !== undefined && typeof payload.is_active !== 'boolean') {
    errors.is_active = 'is_active debe ser boolean';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCategory(data: unknown) {
  const errors: Record<string, string> = {};
  const payload = asRecord(data);

  if (!validateRequired(payload.name)) errors.name = 'El nombre es requerido';
  if (typeof payload.slug === 'string' && payload.slug && !validateSlug(payload.slug)) {
    errors.slug = 'El slug debe tener un formato válido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
