import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar cookies antes de cada test
    await page.context().clearCookies();
  });

  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Debería redirigir al login
    await expect(page).toHaveURL('/admin/login');
    
    // Verificar elementos del login
    await expect(page.locator('h1')).toContainText('Admin Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Intentar login con credenciales inválidas
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Debería mostrar error
    await expect(page.locator('text=Credenciales incorrectas')).toBeVisible();
    // Debería permanecer en login
    await expect(page).toHaveURL('/admin/login');
  });

  test('should handle empty form submission', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Enviar formulario vacío
    await page.click('button[type="submit"]');
    
    // Debería mostrar errores de validación
    await expect(page.locator('text=El email es requerido')).toBeVisible();
    await expect(page.locator('text=La contraseña es requerida')).toBeVisible();
  });

  test('should redirect correctly after successful admin login', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Login con credenciales de admin (simulado)
    await page.fill('input[type="email"]', 'facudev4@gmail.com');
    await page.fill('input[type="password"]', 'adminpassword123');
    await page.click('button[type="submit"]');
    
    // Esperar redirección
    await page.waitForURL('/admin/superadmin', { timeout: 10000 });
    
    // Verificar que estamos en el dashboard correcto
    await expect(page).toHaveURL('/admin/superadmin');
    
    // Verificar elementos del dashboard
    await expect(page.locator('h1')).toContainText('Panel de Análisis');
  });

  test('should redirect basic admin to correct dashboard', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Login con credenciales de admin básico
    await page.fill('input[type="email"]', 'facucercuetti420@gmail.com');
    await page.fill('input[type="password"]', 'adminpassword123');
    await page.click('button[type="submit"]');
    
    // Esperar redirección al dashboard básico
    await page.waitForURL('/admin/dashboard', { timeout: 10000 });
    
    // Verificar que estamos en el dashboard correcto
    await expect(page).toHaveURL('/admin/dashboard');
    
    // Verificar elementos del dashboard
    await expect(page.locator('h1')).toContainText('Panel de Análisis');
  });

  test('should maintain session across navigation', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Login exitoso
    await page.fill('input[type="email"]', 'facudev4@gmail.com');
    await page.fill('input[type="password"]', 'adminpassword123');
    await page.click('button[type="submit"]');
    
    // Esperar redirección
    await page.waitForURL('/admin/superadmin', { timeout: 10000 });
    
    // Navegar a otras páginas admin
    await page.goto('/admin/products');
    await expect(page).toHaveURL('/admin/products');
    
    // Volver al dashboard
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/admin/dashboard');
    
    // No debería redirigir al login (sesión mantenida)
  });

  test('should handle logout correctly', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Login
    await page.fill('input[type="email"]', 'facudev4@gmail.com');
    await page.fill('input[type="password"]', 'adminpassword123');
    await page.click('button[type="submit"]');
    
    // Esperar redirección
    await page.waitForURL('/admin/superadmin', { timeout: 10000 });
    
    // Buscar y hacer clic en logout (si existe el botón)
    const logoutButton = page.locator('button:has-text("Cerrar sesión"), button:has-text("Logout"), a:has-text("Cerrar sesión")');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Debería redirigir al login
      await expect(page).toHaveURL('/admin/login');
    } else {
      // Si no hay botón de logout, verificar que las cookies se pueden limpiar
      await page.context().clearCookies();
      await page.goto('/admin/dashboard');
      
      // Debería redirigir al login
      await expect(page).toHaveURL('/admin/login');
    }
  });

  test('should protect API routes', async ({ page }) => {
    // Intentar acceder a API directamente sin autenticación
    const response = await page.request.get('/api/products');
    
    // Debería devolver 401 o redirigir
    expect([401, 403]).toContain(response.status());
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Simular condiciones de red lentas
    await page.route('**/api/auth/login', async route => {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Network error' })
      });
    });
    
    // Intentar login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Debería mostrar mensaje de error de red
    await expect(page.locator('text=Network error')).toBeVisible({ timeout: 5000 });
  });
});
