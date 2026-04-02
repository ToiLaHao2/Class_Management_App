import { test, expect } from '@playwright/test';

test.describe('Authentication and Registration Flow', () => {
  
  test('should register a new TEACHER successfully', async ({ page }) => {
    const uniqueId = Math.random().toString(36).substring(7);
    const username = `teacher_${uniqueId}`;
    await page.goto('/register');
    
    // Sử dụng filter hasText để vượt qua các vấn đề về Emoji/Spans
    await page.locator('button').filter({ hasText: 'Giáo viên' }).click();
    
    await page.locator('#register-fullname').fill(`Auto Teacher ${uniqueId}`);
    await page.locator('#register-username').fill(username);
    await page.locator('#register-bio').fill('I am an automated test teacher');
    await page.locator('#register-email').fill(`${username}@test.com`);
    await page.locator('#register-password').fill('Password123');
    await page.locator('#register-confirm').fill('Password123');
    
    await page.locator('button').filter({ hasText: 'Tạo tài khoản' }).click();
    
    await page.waitForURL('**/login', { timeout: 15000 });
    
    await page.locator('#login-identifier').fill(username);
    await page.locator('#login-password').fill('Password123');
    await page.locator('button').filter({ hasText: 'Đăng nhập' }).click();
    
    await page.waitForURL('**/', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Chào', { timeout: 10000 });
  });

  test('should register a new STUDENT successfully', async ({ page }) => {
    const uniqueId = Math.random().toString(36).substring(7);
    const username = `student_${uniqueId}`;
    await page.goto('/register');
    
    await page.locator('button').filter({ hasText: 'Học sinh' }).click();
    
    await page.locator('#register-fullname').fill(`Auto Student ${uniqueId}`);
    await page.locator('#register-username').fill(username);
    await page.locator('#register-school').fill('Automation High');
    await page.locator('#register-grade').fill('10A');
    await page.locator('#register-email').fill(`${username}@test.com`);
    await page.locator('#register-password').fill('Password123');
    await page.locator('#register-confirm').fill('Password123');
    
    await page.locator('button').filter({ hasText: 'Tạo tài khoản' }).click();
    await page.waitForURL('**/login', { timeout: 15000 });
  });

  test('should register a new PARENT successfully', async ({ page }) => {
    const uniqueId = Math.random().toString(36).substring(7);
    const username = `parent_${uniqueId}`;
    await page.goto('/register');
    
    await page.locator('button').filter({ hasText: 'Phụ huynh' }).click();
    
    await page.locator('#register-fullname').fill(`Auto Parent ${uniqueId}`);
    await page.locator('#register-username').fill(username);
    await page.locator('#register-email').fill(`${username}@test.com`);
    await page.locator('#register-password').fill('Password123');
    await page.locator('#register-confirm').fill('Password123');
    
    await page.locator('button').filter({ hasText: 'Tạo tài khoản' }).click();
    await page.waitForURL('**/login', { timeout: 15000 });
  });
});
