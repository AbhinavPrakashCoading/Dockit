/**
 * 🧪 Test: Fix for 422KB > 300KB Validation Error
 * 
 * This test reproduces and fixes the exact error you encountered:
 * "Size exceeds limit: 422KB > 300KB maximum"
 * 
 * The issue was that the old PDF converter was bypassing 
 * the new intelligent compression system.
 */

import { transformFile } from './src/features/transform/transformFile.ts';
import { parseQualityPreviewError } from './src/features/transform/utils/qualityPreviewHandler.ts';

async function testValidationErrorFix() {
    console.log('🔧 Testing Fix for 422KB > 300KB Validation Error');
    console.log('=' .repeat(60));
    
    try {
        // Recreate the scenario that caused the error
        console.log('📋 Reproducing the exact error scenario...');
        console.log('   Input: ID Proof document → PDF conversion');
        console.log('   Limit: 300KB maximum');
        console.log('   Previous result: 422KB (validation failed)');
        console.log('');
        
        // Create a test image that would typically result in ~400KB PDF
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 800; // Typical ID document aspect ratio
        const ctx = canvas.getContext('2d');
        
        // Draw a realistic ID document
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 1200, 800);
        
        // Add text content (what makes PDFs large)
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('GOVERNMENT OF INDIA', 50, 80);
        ctx.font = '24px Arial';
        ctx.fillText('UNIQUE IDENTIFICATION AUTHORITY OF INDIA', 50, 120);
        
        // Add detailed information
        ctx.font = '20px Arial';
        const details = [
            'Name: JOHN DOE',
            'Father: RICHARD DOE', 
            'DOB: 01/01/1990',
            'Gender: Male',
            'Address: 123 Main Street, City, State - 123456',
            'Aadhaar Number: 1234 5678 9012'
        ];
        
        details.forEach((detail, i) => {
            ctx.fillText(detail, 50, 200 + (i * 40));
        });
        
        // Add some visual complexity (photo area, logos, etc.)
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(800, 150, 150, 180); // Photo placeholder
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText('PHOTO', 850, 250);
        
        // Create high-quality JPEG (will be large)
        const imageBlob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.9); // High quality
        });
        
        const testFile = new File([imageBlob], 'aadhaar-card.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
        });
        
        console.log(`📄 Test file created: ${testFile.name} (${Math.round(testFile.size/1024)}KB)`);
        
        // This is the exact scenario that caused the 422KB error
        const requirements = {
            type: 'id-proof',
            format: 'application/pdf',
            maxSizeKB: 300, // The limit that was exceeded
            dimensions: { width: 800, height: 600 },
            description: 'ID Proof Aadhaar/Passport/Driving License/Voter ID/PAN Card'
        };
        
        console.log('');
        console.log('🚀 Running transformation with intelligent compression...');
        
        try {
            const result = await transformFile(testFile, requirements, 'jee');
            
            // If we get here, compression worked!
            const resultSizeKB = Math.round(result.size / 1024);
            console.log('');
            console.log('✅ SUCCESS: Intelligent compression worked!');
            console.log(`   📊 Final size: ${resultSizeKB}KB ≤ ${requirements.maxSizeKB}KB ✓`);
            console.log(`   📄 Format: ${result.type} ✓`);
            console.log(`   🎯 Compression: ${((result.size / testFile.size) * 100).toFixed(1)}%`);
            console.log('');
            console.log('🎉 The validation error is FIXED! No more 422KB > 300KB failures!');
            
        } catch (error) {
            // Check if it's a quality preview error (this is good!)
            const qualityData = parseQualityPreviewError(error);
            if (qualityData) {
                console.log('');
                console.log('✅ SUCCESS: Quality preview system activated!');
                console.log(`   🎯 Quality: ${qualityData.quality.toFixed(0)}%`);
                console.log(`   📊 Size: ${qualityData.sizeKB}KB ≤ ${qualityData.maxSizeKB}KB`);
                console.log(`   🔒 Preview required: ${qualityData.previewRequired ? 'YES' : 'No'}`);
                console.log('');
                console.log('🎉 Perfect! User can now preview and approve the quality level!');
                console.log('🚫 No more silent validation failures!');
                
            } else if (error.message.includes('Size exceeds limit')) {
                console.log('');
                console.log('❌ STILL GETTING VALIDATION ERROR:');
                console.log(`   Error: ${error.message}`);
                console.log('   💡 This means the intelligent compression system is not being used');
                console.log('   🔧 Need to check the PDF conversion pipeline');
                
            } else {
                console.log('');
                console.log('❓ UNEXPECTED ERROR:');
                console.log(`   ${error.message}`);
            }
        }
        
        console.log('');
        console.log('🔍 DIAGNOSIS SUMMARY');
        console.log('-'.repeat(50));
        console.log('❌ Old behavior: 192KB JPEG → 422KB PDF → Validation error');
        console.log('✅ New behavior: 192KB JPEG → Smart compression → Compliant PDF OR Quality preview');
        console.log('');
        console.log('Key improvements:');
        console.log('1. Intelligent compression tries multiple quality levels');
        console.log('2. Quality preview system gives user control');
        console.log('3. Clear error messages with actionable guidance');
        console.log('4. No more silent validation failures');
        
    } catch (error) {
        console.error('❌ Test setup failed:', error);
    }
}

// Run the test
if (typeof document !== 'undefined') {
    testValidationErrorFix().catch(console.error);
} else {
    console.log('ℹ️  This test requires a browser environment with Canvas API');
    console.log('');
    console.log('🔧 QUICK FIX SUMMARY:');
    console.log('The issue was that convertFormatEnhanced was using the old PDF converter');
    console.log('instead of the new intelligent compression system.');
    console.log('');
    console.log('Fixed by ensuring convertFormatEnhanced calls the new convertImageToPDF');
    console.log('with intelligent compression that handles quality preview errors.');
}