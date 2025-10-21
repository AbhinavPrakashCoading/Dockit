/**
 * 🧪 Test: Quality Preview & Caution System
 * 
 * This test demonstrates the new user-friendly quality preview system:
 * 
 * 1. Quality 90%+: No warnings (silent success)
 * 2. Quality 50-89%: Caution message (optional preview)  
 * 3. Quality <50%: Mandatory preview (user must approve)
 */

import { transformFile } from './src/features/transform/transformFile.ts';
import { parseQualityPreviewError, getQualityMessage, getQualityRecommendations } from './src/features/transform/utils/qualityPreviewHandler.ts';

async function testQualityPreviewSystem() {
    console.log('🧪 Testing Quality Preview & Caution System');
    console.log('=' .repeat(60));
    
    try {
        // Create a large test image that will require compression
        const canvas = document.createElement('canvas');
        canvas.width = 2000;
        canvas.height = 1500;
        const ctx = canvas.getContext('2d');
        
        // Draw a detailed mock document (will need compression)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 2000, 1500);
        ctx.fillStyle = '#000000';
        ctx.font = '48px Arial';
        ctx.fillText('GOVERNMENT DOCUMENT', 100, 100);
        ctx.font = '32px Arial';
        for (let i = 0; i < 20; i++) {
            ctx.fillText(`Line ${i + 1}: Important document information here`, 100, 200 + i * 50);
        }
        
        // Add some visual complexity
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            ctx.arc(200 + i * 15, 800 + Math.sin(i) * 100, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        const imageBlob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.9);
        });
        
        const testFile = new File([imageBlob], 'complex-document.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
        });
        
        console.log(`📄 Created test document: ${Math.round(testFile.size/1024)}KB`);
        console.log('');
        
        // Test Case 1: Very strict limit (will trigger mandatory preview)
        console.log('📋 Test Case 1: Very Strict Limit (50KB) - Should trigger MANDATORY preview');
        console.log('-'.repeat(50));
        
        const strictRequirements = {
            type: 'id-proof',
            format: 'application/pdf',
            maxSizeKB: 50, // Very strict - will force very low quality
            dimensions: { width: 800, height: 600 },
            description: 'ID Proof Document'
        };
        
        try {
            await transformFile(testFile, strictRequirements, 'jee');
            console.log('❓ Unexpected success - should have triggered preview');
        } catch (error) {
            const qualityData = parseQualityPreviewError(error);
            if (qualityData) {
                const message = getQualityMessage(qualityData);
                const recommendations = getQualityRecommendations(qualityData);
                
                console.log(`${message.icon} ${message.title}`);
                console.log(`📝 Message: ${message.message}`);
                console.log(`🎯 Quality: ${qualityData.quality.toFixed(0)}%`);
                console.log(`📊 Size: ${qualityData.sizeKB}KB (target: ≤${qualityData.maxSizeKB}KB)`);
                console.log(`🔒 Preview Required: ${qualityData.previewRequired ? 'YES (Mandatory)' : 'No (Optional)'}`);
                console.log('💡 Recommendations:');
                recommendations.forEach(rec => console.log(`   ${rec}`));
                
                // Simulate user approval
                if (qualityData.previewPDF) {
                    console.log('✅ User can preview and approve/reject this quality level');
                }
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
        console.log('');
        
        // Test Case 2: Moderate limit (will trigger caution)
        console.log('📋 Test Case 2: Moderate Limit (200KB) - Should trigger CAUTION');
        console.log('-'.repeat(50));
        
        const moderateRequirements = {
            type: 'id-proof',
            format: 'application/pdf',
            maxSizeKB: 200, // Moderate - will reduce quality but not drastically
            dimensions: { width: 800, height: 600 },
            description: 'ID Proof Document'
        };
        
        try {
            await transformFile(testFile, moderateRequirements, 'jee');
            console.log('❓ Unexpected success - should have triggered caution');
        } catch (error) {
            const qualityData = parseQualityPreviewError(error);
            if (qualityData) {
                const message = getQualityMessage(qualityData);
                
                console.log(`${message.icon} ${message.title}`);
                console.log(`📝 Message: ${message.message}`);
                console.log(`🎯 Quality: ${qualityData.quality.toFixed(0)}%`);
                console.log(`📊 Size: ${qualityData.sizeKB}KB (target: ≤${qualityData.maxSizeKB}KB)`);
                console.log(`🔒 Preview Required: ${qualityData.previewRequired ? 'YES (Mandatory)' : 'No (Optional)'}`);
                
                // User can choose to continue or not
                console.log('✅ User can continue without preview or choose to preview');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
        console.log('');
        console.log('🎯 QUALITY PREVIEW SYSTEM SUMMARY');
        console.log('=' .repeat(60));
        console.log('🟢 Quality 90%+: Silent success (no warnings)');
        console.log('🟡 Quality 50-89%: Caution message (optional preview)');
        console.log('🔴 Quality <50%: Mandatory preview (user must approve)');
        console.log('');
        console.log('✅ Users now have full control over quality vs size trade-offs!');
        console.log('✅ No more surprise quality degradation!');
        console.log('✅ Clear recommendations for improving results!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Mock UI Integration Example
function showUIExample() {
    console.log('');
    console.log('📱 SAMPLE UI INTEGRATION');
    console.log('=' .repeat(60));
    console.log(`
    // In your React/Vue/Angular component:
    
    try {
        const result = await transformFile(file, requirements, examType);
        // Success - no quality issues
        showSuccess("Document processed successfully!");
        
    } catch (error) {
        const qualityData = parseQualityPreviewError(error);
        
        if (qualityData) {
            // Show quality preview modal
            if (qualityData.previewRequired) {
                showMandatoryPreviewModal({
                    quality: qualityData.quality,
                    previewFile: qualityData.previewPDF,
                    onApprove: () => useFile(qualityData.previewPDF),
                    onReject: () => showAlternatives()
                });
            } else {
                showQualityCautionDialog({
                    quality: qualityData.quality,
                    onContinue: () => useFile(qualityData.previewPDF),
                    onPreview: () => showPreview(qualityData.previewPDF),
                    onCancel: () => tryDifferentFile()
                });
            }
        } else {
            // Handle other errors
            showError(error.message);
        }
    }
    `);
}

// Run tests if in browser environment
if (typeof document !== 'undefined') {
    testQualityPreviewSystem().then(() => {
        showUIExample();
    }).catch(console.error);
} else {
    console.log('ℹ️  This test requires a browser environment with Canvas API');
    showUIExample();
}