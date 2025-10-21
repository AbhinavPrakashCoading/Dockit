/**
 * Test file to verify the requirement matching logic works correctly
 * This simulates the ID proof transformation scenario from the processing report
 */

import { staticSchemas } from '@/features/exam/staticSchemas';

// Mock file that simulates your Aadhaar document
const mockAadhaarFile = {
  name: 'Aadhaar.jpeg',
  type: 'image/jpeg',
  size: 196608, // 192KB in bytes
  documentType: 'ID Proof Aadhaar/Passport/Driving License/Voter ID/PAN Card'
} as any;

// Get JEE schema requirements
const jeeSchema = staticSchemas['jee-mains-2025'];

console.log('🧪 Testing requirement matching logic...\n');

// Test the improved matching logic
function findMatchingRequirement(file: any, requirements: any[]): any | null {
  const fileName = file.name.toLowerCase();
  
  // Strategy 1: Check if file has document type metadata and match by type
  if (file.documentType) {
    const byDocumentType = requirements.find(req => 
      file.documentType.toLowerCase().includes(req.type.toLowerCase()) ||
      req.type.toLowerCase().includes(file.documentType.toLowerCase())
    );
    if (byDocumentType) {
      console.log(`✅ Matched "${file.name}" by document type "${file.documentType}" to requirement "${byDocumentType.type}"`);
      return byDocumentType;
    }
  }
  
  return null;
}

if (jeeSchema) {
  console.log('📋 Available requirements:');
  jeeSchema.requirements.forEach(req => {
    console.log(`  - ${req.type}: format=${req.format}, maxSize=${req.maxSizeKB}KB, mandatory=${req.mandatory}`);
  });
  
  console.log('\n🎯 Testing Aadhaar file matching:');
  const matchedReq = findMatchingRequirement(mockAadhaarFile, jeeSchema.requirements);
  
  if (matchedReq) {
    console.log(`\n🎉 SUCCESS: Found matching requirement!`);
    console.log(`   File: ${mockAadhaarFile.name} (${mockAadhaarFile.type}, ${mockAadhaarFile.size} bytes)`);
    console.log(`   Document Type: ${mockAadhaarFile.documentType}`);
    console.log(`   Matched Requirement: ${matchedReq.type}`);
    console.log(`   Required Format: ${matchedReq.format}`);
    console.log(`   Max Size: ${matchedReq.maxSizeKB}KB`);
    console.log(`   
⚠️  TRANSFORMATION NEEDED: 
   Current: ${mockAadhaarFile.type} (JPEG)
   Required: ${matchedReq.format} (PDF)
   This should trigger format conversion!`);
  } else {
    console.log('❌ FAILED: No matching requirement found');
  }
} else {
  console.log('❌ JEE schema not found');
}

export {};