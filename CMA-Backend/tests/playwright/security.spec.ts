import { test, expect } from '@playwright/test';

/**
 * Bộ Test Bảo mật: Kiểm tra các kịch bản lỗi và lỗ hổng dữ liệu
 */
test.describe('Registration Security and Validation', () => {

  test('should NOT allow registration with duplicate username', async ({ page }) => {
    const uniqueId = Math.random().toString(36).substring(7);
    const username = `u_sec_${uniqueId}`;
    const email = `e_sec_${uniqueId}@test.com`;

    // 1. Đăng ký lần đầu
    await page.goto('/register');
    await page.getByRole('button', { name: /Phụ huynh/ }).click();
    await page.locator('#register-fullname').fill('Base User');
    await page.locator('#register-username').fill(username);
    await page.locator('#register-email').fill(email);
    await page.locator('#register-password').fill('Password123');
    await page.locator('#register-confirm').fill('Password123');
    await page.getByRole('button', { name: /Tạo tài khoản/ }).click();
    await page.waitForURL('**/login', { timeout: 15000 });

    // 2. Thử đăng ký lần 2 với cùng username
    await page.goto('/register');
    await page.getByRole('button', { name: /Phụ huynh/ }).click();
    await page.locator('#register-fullname').fill('Duplicate Name Test');
    await page.locator('#register-username').fill(username); // TRÙNG
    await page.locator('#register-email').fill(`new_${email}`);
    await page.locator('#register-password').fill('Password123');
    await page.locator('#register-confirm').fill('Password123');
    await page.getByRole('button', { name: /Tạo tài khoản/ }).click();
    
    await expect(page.locator('text=Tên đăng nhập đã tồn tại')).toBeVisible({ timeout: 10000 });
  });

  test('should NOT allow registration with duplicate email', async ({ page }) => {
    const uniqueId = Math.random().toString(36).substring(7);
    const username = `u_sec_2_${uniqueId}`;
    const email = `e_sec_2_${uniqueId}@test.com`;

    // 1. Đăng ký lần đầu
    await page.goto('/register');
    await page.getByRole('button', { name: /Phụ huynh/ }).click();
    await page.locator('#register-fullname').fill('Base User');
    await page.locator('#register-username').fill(username);
    await page.locator('#register-email').fill(email);
    await page.locator('#register-password').fill('Password123');
    await page.locator('#register-confirm').fill('Password123');
    await page.getByRole('button', { name: /Tạo tài khoản/ }).click();
    await page.waitForURL('**/login', { timeout: 15000 });

    // 2. Thử đăng ký lần 2 với cùng email
    await page.goto('/register');
    await page.getByRole('button', { name: /Phụ huynh/ }).click();
    await page.locator('#register-fullname').fill('Duplicate Email Test');
    await page.locator('#register-username').fill(`another_${username}`);
    await page.locator('#register-email').fill(email); // TRÙNG EMAIL
    await page.locator('#register-password').fill('Password123');
    await page.locator('#register-confirm').fill('Password123');
    await page.getByRole('button', { name: /Tạo tài khoản/ }).click();
    
    await expect(page.locator('text=Email đã được sử dụng')).toBeVisible({ timeout: 10000 });
  });

  test('should NOT allow registration when passwords do not match', async ({ page }) => {
    await page.goto('/register');
    await page.locator('#register-password').fill('Password123');
    await page.locator('#register-confirm').fill('WrongPassword');
    await page.getByRole('button', { name: /Tạo tài khoản/ }).click();
    
    await expect(page.locator('text=Mật khẩu xác nhận không khớp!')).toBeVisible({ timeout: 10000 });
  });
});
