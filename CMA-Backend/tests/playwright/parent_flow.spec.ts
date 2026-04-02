import { test, expect } from '@playwright/test';

/**
 * Bộ Test kiểm tra luồng Phụ huynh quản lý và tạo tài khoản cho con
 */
test.describe('Parent-Child Integration Flow', () => {

  test('should allow parent to register, create child, and then child login', async ({ page }) => {
    const uniqueId = Math.random().toString(36).substring(7);
    const parentUsername = `parent_${uniqueId}`;
    const childUsername = `child_${uniqueId}`;

    // 1. Phụ huynh đăng ký
    await page.goto('/register');
    await page.getByRole('button', { name: /Phụ huynh/ }).click();
    await page.locator('#register-fullname').fill(`Auto Parent ${uniqueId}`);
    await page.locator('#register-username').fill(parentUsername);
    await page.locator('#register-email').fill(`${parentUsername}@test.com`);
    await page.locator('#register-password').fill('Password123');
    await page.locator('#register-confirm').fill('Password123');
    await page.getByRole('button', { name: /Tạo tài khoản/ }).click();
    await page.waitForURL('**/login', { timeout: 15000 });

    // 2. Phụ huynh đăng nhập
    await page.locator('#login-identifier').fill(parentUsername);
    await page.locator('#login-password').fill('Password123');
    await page.getByRole('button', { name: /Đăng nhập/ }).click();
    await page.waitForURL('**/', { timeout: 15000 });

    // 3. Phụ huynh tạo tài khoản cho con
    await page.goto('/parent/register-child');
    await page.locator('#child-fullname').fill(`Auto Child ${uniqueId}`);
    await page.locator('#child-username').fill(childUsername);
    await page.getByRole('button', { name: /Xác nhận tạo tài khoản/ }).click();
    
    // Kiểm tra thành công
    await expect(page.locator('text=Đăng ký thành công!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Classify@123')).toBeVisible();

    // 4. Logout để test login của con
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // 5. Con đăng nhập
    await page.goto('/login');
    await page.locator('#login-identifier').fill(childUsername);
    await page.locator('#login-password').fill('Classify@123');
    await page.getByRole('button', { name: /Đăng nhập/ }).click();
    
    // Con vào dashboard thành công
    await page.waitForURL('**/', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Chào', { timeout: 10000 });
  });
});
