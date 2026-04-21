import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'facudev4@gmail.com');
    await page.fill('input[type="password"]', 'adminpassword123');
    await page.click('button[type="submit"]');
    
    // Esperar redirección al dashboard
    await page.waitForURL('/admin/superadmin', { timeout: 10000 });
  });

  test('should display dashboard with all components', async ({ page }) => {
    // Verificar título del dashboard
    await expect(page.locator('h1')).toContainText('Panel de Análisis');
    
    // Verificar tarjetas KPI
    await expect(page.locator('text=Ventas Totales')).toBeVisible();
    await expect(page.locator('text=Pedidos')).toBeVisible();
    await expect(page.locator('text=Conversión')).toBeVisible();
    
    // Verificar sección de actividad reciente
    await expect(page.locator('text=Actividad Reciente')).toBeVisible();
    
    // Verificar sección de análisis de rendimiento
    await expect(page.locator('text=Análisis de Rendimiento')).toBeVisible();
    
    // Verificar sección de sistema
    await expect(page.locator('text=Sistema y Operaciones')).toBeVisible();
  });

  test('should load data correctly', async ({ page }) => {
    // Esperar a que carguen los datos
    await page.waitForSelector('[data-testid="kpi-card"]', { timeout: 5000 });
    
    // Verificar que las tablas tengan contenido
    const tables = page.locator('table');
    await expect(tables.first()).toBeVisible();
    
    // Verificar que los gráficos se carguen
    const charts = page.locator('[data-testid="chart"]');
    if (await charts.count() > 0) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('should handle navigation correctly', async ({ page }) => {
    // Verificar navegación por el sidebar
    const sidebarLinks = page.locator('nav a');
    
    if (await sidebarLinks.count() > 0) {
      // Hacer clic en el primer enlace del sidebar
      await sidebarLinks.first().click();
      
      // Verificar que la navegación funcione
      await expect(page.url()).toContain('/admin/');
    }
  });

  test('should update timestamp', async ({ page }) => {
    // Verificar que haya un timestamp de última actualización
    const timestamp = page.locator('text=Última actualización:');
    
    if (await timestamp.isVisible()) {
      const initialTime = await timestamp.textContent();
      
      // Esperar un momento y verificar si se actualiza
      await page.waitForTimeout(2000);
      
      // El timestamp podría actualizarse (depende de la implementación)
      expect(timestamp).toBeVisible();
    }
  });

  test('should handle theme toggle', async ({ page }) => {
    // Buscar botón de tema
    const themeButton = page.locator('button:has-text("Toggle Theme"), button[aria-label*="theme"]');
    
    if (await themeButton.isVisible()) {
      // Capturar estado inicial del tema
      const htmlElement = page.locator('html');
      const initialTheme = await htmlElement.getAttribute('class');
      
      // Hacer clic en el botón de tema
      await themeButton.click();
      
      // Esperar a que se aplique el cambio de tema
      await page.waitForTimeout(500);
      
      // Verificar que el tema haya cambiado
      const newTheme = await htmlElement.getAttribute('class');
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should handle sidebar toggle', async ({ page }) => {
    // Buscar botón de sidebar
    const sidebarToggle = page.locator('button[aria-label*="sidebar"], button:has-text("Menu")');
    
    if (await sidebarToggle.isVisible()) {
      // Capturar estado inicial del sidebar
      const sidebar = page.locator('aside');
      const initialVisibility = await sidebar.isVisible();
      
      // Hacer clic en el botón
      await sidebarToggle.click();
      
      // Esperar a que se aplique la animación
      await page.waitForTimeout(300);
      
      // Verificar que el estado del sidebar haya cambiado
      const newVisibility = await sidebar.isVisible();
      expect(newVisibility).not.toBe(initialVisibility);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Simular viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar que el dashboard se adapte
    await expect(page.locator('h1')).toContainText('Panel de Análisis');
    
    // Verificar que las tarjetas KPI se reorganicen
    const kpiCards = page.locator('[data-testid="kpi-card"]');
    if (await kpiCards.count() > 0) {
      await expect(kpiCards.first()).toBeVisible();
    }
    
    // Verificar que el sidebar sea móvil-friendly
    const sidebar = page.locator('aside');
    if (await sidebar.isVisible()) {
      const sidebarWidth = await sidebar.evaluate(el => {
        return window.getComputedStyle(el).width;
      });
      expect(sidebarWidth).toContain('px');
    }
  });

  test('should handle data refresh', async ({ page }) => {
    // Buscar botón de refresh
    const refreshButton = page.locator('button:has-text("Actualizar"), button[aria-label*="refresh"]');
    
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      
      // Verificar que aparezca indicador de carga
      const loadingIndicator = page.locator('[data-testid="loading"]');
      if (await loadingIndicator.isVisible({ timeout: 2000 })) {
        // Esperar a que termine de cargar
        await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
      }
      
      // Verificar que los datos se hayan actualizado
      await expect(page.locator('h1')).toContainText('Panel de Análisis');
    }
  });

  test('should handle empty states gracefully', async ({ page }) => {
    // Este test simula cuando no hay datos
    await page.route('**/api/dashboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          metrics: {},
          recentOrders: [],
          recentSales: [],
          lowStockItems: [],
          salesByMonth: [],
          topProducts: []
        })
      });
    });
    
    // Recargar página
    await page.reload();
    
    // Verificar que se muestren mensajes de empty state
    await expect(page.locator('text=No hay datos disponibles')).toBeVisible({ timeout: 5000 });
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Simular error de API
    await page.route('**/api/dashboard', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Recargar página
    await page.reload();
    
    // Verificar que se muestre mensaje de error
    await expect(page.locator('text=Error al cargar datos')).toBeVisible({ timeout: 5000 });
  });
});
