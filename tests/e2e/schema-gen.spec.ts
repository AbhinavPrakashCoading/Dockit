import { test, expect } from '@playwright/test';

test.describe('Schema Generator UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/schema-gen');
  });

  test('should generate schema for JEE Main 2026', async ({ page }) => {
    // Fill in the form
    await page.fill('input[name="exam_form"]', 'JEE Main 2026');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for schema table to appear
    await page.waitForSelector('[data-testid="schema-table"]', { timeout: 10000 });
    
    // Verify schema table has at least 15 rows
    const rows = await page.locator('[data-testid="schema-table"] tbody tr').count();
    expect(rows).toBeGreaterThanOrEqual(15);
    
    // Verify coverage bar is at least 95%
    const coverageBar = page.locator('[data-testid="coverage-bar"]');
    const coverageValue = await coverageBar.getAttribute('value');
    expect(Number(coverageValue)).toBeGreaterThanOrEqual(95);
  });

  test('should edit field type', async ({ page }) => {
    // Generate schema first
    await page.fill('input[name="exam_form"]', 'JEE Main 2026');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="schema-table"]');
    
    // Find and edit a select field
    const selectField = page.locator('[data-testid="schema-table"] select').first();
    await selectField.selectOption('date');
    
    // Wait for debounced save
    await page.waitForTimeout(600);
    
    // Verify the change
    const selectedValue = await selectField.inputValue();
    expect(selectedValue).toBe('date');
  });

  test('should edit field pattern', async ({ page }) => {
    // Generate schema first
    await page.fill('input[name="exam_form"]', 'JEE Main 2026');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="schema-table"]');
    
    // Find roll_no field and edit pattern
    const rows = page.locator('[data-testid="schema-table"] tbody tr');
    const rowCount = await rows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const fieldName = await row.locator('td').first().textContent();
      
      if (fieldName?.includes('roll')) {
        const patternInput = row.locator('input[placeholder="Regex pattern"]');
        await patternInput.fill('^[0-9]{10}$');
        await page.waitForTimeout(600); // Wait for debounced save
        break;
      }
    }
  });

  test('should toggle required checkbox', async ({ page }) => {
    // Generate schema first
    await page.fill('input[name="exam_form"]', 'JEE Main 2026');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="schema-table"]');
    
    // Find and toggle first checkbox
    const checkbox = page.locator('[data-testid="schema-table"] input[type="checkbox"]').first();
    const initialState = await checkbox.isChecked();
    await checkbox.click();
    
    // Wait for debounced save
    await page.waitForTimeout(600);
    
    // Verify the toggle
    const newState = await checkbox.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should delete a field', async ({ page }) => {
    // Generate schema first
    await page.fill('input[name="exam_form"]', 'JEE Main 2026');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="schema-table"]');
    
    // Count initial rows
    const initialRowCount = await page.locator('[data-testid="schema-table"] tbody tr').count();
    
    // Click first delete button
    await page.click('[data-testid="schema-table"] tbody tr button:has-text("Delete")');
    
    // Wait for debounced save
    await page.waitForTimeout(600);
    
    // Verify row count decreased
    const newRowCount = await page.locator('[data-testid="schema-table"] tbody tr').count();
    expect(newRowCount).toBe(initialRowCount - 1);
  });

  test('should test on sample document', async ({ page }) => {
    // Generate schema first
    await page.fill('input[name="exam_form"]', 'JEE Main 2026');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="schema-table"]');
    
    // Click test sample button
    await page.click('[data-testid="test-sample"]');
    
    // Wait for validation preview to appear
    await page.waitForSelector('[data-testid="val-preview"]', { timeout: 5000 });
    
    // Verify preview contains 'compliant' or validation data
    const previewText = await page.locator('[data-testid="val-preview"]').textContent();
    expect(previewText).toBeTruthy();
    expect(previewText).toContain('"totalFiles"');
  });

  test('should display issues in metrics section', async ({ page }) => {
    // Generate schema first
    await page.fill('input[name="exam_form"]', 'JEE Main 2026');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="schema-table"]');
    
    // Check if issues list exists
    const issuesList = page.locator('[data-testid="issues"]');
    const isVisible = await issuesList.isVisible();
    
    if (isVisible) {
      const issueItems = await issuesList.locator('li').count();
      expect(issueItems).toBeGreaterThan(0);
    }
  });

  test('E2E: Generate → Edit roll_no pattern → Test pass', async ({ page }) => {
    // Step 1: Generate schema
    await page.fill('input[name="exam_form"]', 'JEE Main 2026');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="schema-table"]');
    
    // Step 2: Edit roll_no pattern
    const rows = page.locator('[data-testid="schema-table"] tbody tr');
    const rowCount = await rows.count();
    
    let foundRollNo = false;
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const fieldName = await row.locator('td').first().textContent();
      
      if (fieldName?.toLowerCase().includes('roll')) {
        const patternInput = row.locator('input[placeholder="Regex pattern"]');
        await patternInput.fill('^[0-9]{10}$');
        await page.waitForTimeout(600); // Wait for debounced save
        foundRollNo = true;
        break;
      }
    }
    
    // Step 3: Test on sample
    await page.click('[data-testid="test-sample"]');
    await page.waitForSelector('[data-testid="val-preview"]', { timeout: 5000 });
    
    // Step 4: Verify test passed
    const previewText = await page.locator('[data-testid="val-preview"]').textContent();
    expect(previewText).toBeTruthy();
    
    // Verify the validation report structure
    expect(previewText).toContain('"totalFiles"');
    expect(previewText).toContain('"processedFiles"');
    
    // If we found and edited roll_no, verify it was saved
    if (foundRollNo) {
      // Toast notification should appear
      const toastText = await page.locator('.Toaster').textContent();
      expect(toastText).toContain('updated');
    }
  });
});
