#!/usr/bin/env tsx
/**
 * Standalone test for the TypeScript Schema Extraction Engine
 * Run with: npx tsx test-schema-extraction-engine.ts
 */

import { SchemaExtractionEngine } from './src/engines/schema-extraction/index.js';

async function testSchemaExtraction() {
    console.log('🚀 Starting TypeScript Schema Extraction Engine Test\n');
    
    const engine = new SchemaExtractionEngine({
        enableWebScraping: true,
        enablePDFExtraction: true,
        fallbackEnabled: true,
        timeout: 30000
    });

    const testExams = [
        'IBPS Clerk 2025',
        'SSC CGL 2025', 
        'NEET UG 2025',
        'UPSC Civil Services',
        'JEE Main 2025'
    ];

    for (const examName of testExams) {
        try {
            console.log(`\n📋 Testing: ${examName}`);
            console.log('━'.repeat(50));
            
            const startTime = Date.now();
            const result = await engine.generateExamSchema(examName);
            const duration = Date.now() - startTime;
            
            console.log(`✅ Success in ${duration}ms`);
            console.log(`📊 Exam: ${result.exam}`);
            console.log(`📄 Documents: ${result.documents.length}`);
            console.log(`🔍 Source: ${result.extractedFrom}`);
            
            // Show first document as example
            if (result.documents.length > 0) {
                const doc = result.documents[0];
                console.log(`\n📋 Sample Document (${doc.type}):`);
                console.log(`   Format: ${doc.requirements.format?.join(', ') || 'Not specified'}`);
                console.log(`   Size: ${doc.requirements.size_kb ? `${doc.requirements.size_kb.min}-${doc.requirements.size_kb.max} KB` : 'Not specified'}`);
                console.log(`   Notes: ${doc.requirements.notes?.[0] || 'No notes'}`);
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    console.log('\n🎉 Test completed!');
    console.log('\n💡 Usage:');
    console.log('   const engine = new SchemaExtractionEngine();');
    console.log('   const schema = await engine.extractSchema("IBPS Clerk 2025");');
}

// Run the test
testSchemaExtraction().catch(console.error);