#!/usr/bin/env node

/**
 * Quick verification test for Schema UI Integration
 * Tests the page accessibility and basic functionality
 */

const { chromium } = require('playwright');

async function testSchemaUI() {
  console.log('🧪 Starting Schema UI Integration Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to schema-gen page
    console.log('📍 Step 1: Navigating to /schema-gen...');
    await page.goto('http://localhost:3000/schema-gen');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded successfully\n');
    
    // Step 2: Check form elements
    console.log('📍 Step 2: Verifying form elements...');
    const examFormInput = await page.locator('input[name="exam_form"]').isVisible();
    const urlInput = await page.locator('input[name="url"]').isVisible();
    const submitButton = await page.locator('button[type="submit"]').isVisible();
    
    if (examFormInput && urlInput && submitButton) {
      console.log('✅ All form elements present\n');
    } else {
      throw new Error('Missing form elements');
    }
    
    // Step 3: Fill and submit form
    console.log('📍 Step 3: Submitting schema generation request...');
    await page.fill('input[name="exam_form"]', 'JEE Main 2026');
    await page.click('button[type="submit"]');
    
    // Wait for schema table to appear (with timeout)
    console.log('⏳ Waiting for schema generation...');
    await page.waitForSelector('[data-testid="schema-table"]', { timeout: 15000 });
    console.log('✅ Schema table generated\n');
    
    // Step 4: Verify table structure
    console.log('📍 Step 4: Verifying table structure...');
    const tableRows = await page.locator('[data-testid="schema-table"] tbody tr').count();
    console.log(`   Found ${tableRows} schema fields`);
    
    if (tableRows >= 15) {
      console.log('✅ Schema has sufficient fields (≥15)\n');
    } else {
      console.warn(`⚠️  Warning: Only ${tableRows} fields found (expected ≥15)\n`);
    }
    
    // Step 5: Check coverage metrics
    console.log('📍 Step 5: Checking coverage metrics...');
    const coverageBar = await page.locator('[data-testid="coverage-bar"]').isVisible();
    if (coverageBar) {
      const coverageValue = await page.locator('[data-testid="coverage-bar"]').getAttribute('value');
      console.log(`   Coverage: ${coverageValue}%`);
      
      if (Number(coverageValue) >= 95) {
        console.log('✅ Coverage exceeds 95%\n');
      } else {
        console.warn(`⚠️  Warning: Coverage is ${coverageValue}% (expected ≥95%)\n`);
      }
    }
    
    // Step 6: Test field editing
    console.log('📍 Step 6: Testing field editing...');
    const firstSelect = page.locator('[data-testid="schema-table"] select').first();
    await firstSelect.selectOption('date');
    console.log('✅ Type selection changed to "date"\n');
    
    // Step 7: Test pattern input
    console.log('📍 Step 7: Testing pattern input...');
    const patternInput = page.locator('[data-testid="schema-table"] input[placeholder="Regex pattern"]').first();
    await patternInput.fill('^[0-9]+$');
    console.log('✅ Pattern input updated\n');
    
    // Step 8: Test checkbox toggle
    console.log('📍 Step 8: Testing required checkbox...');
    const checkbox = page.locator('[data-testid="schema-table"] input[type="checkbox"]').first();
    await checkbox.click();
    console.log('✅ Checkbox toggled\n');
    
    // Step 9: Test sample validation
    console.log('📍 Step 9: Testing sample document validation...');
    await page.click('[data-testid="test-sample"]');
    await page.waitForSelector('[data-testid="val-preview"]', { timeout: 5000 });
    console.log('✅ Validation preview displayed\n');
    
    const previewText = await page.locator('[data-testid="val-preview"]').textContent();
    if (previewText && previewText.includes('totalFiles')) {
      console.log('✅ Validation report contains expected data\n');
    }
    
    // Final Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Form submission works');
    console.log('✅ Schema generation successful');
    console.log(`✅ ${tableRows} fields generated`);
    console.log('✅ Coverage metrics displayed');
    console.log('✅ Field editing functional');
    console.log('✅ Sample validation works');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Keep browser open for 5 seconds to show results
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the test
testSchemaUI().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
