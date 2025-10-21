// Debug the exact lines being processed
const upscText = `Civil Services Examination 2024

Documents Required for Online Application:

1. Recent colour photograph:
   Format: JPEG/JPG only
   Size: Between 50 KB to 300 KB
   Dimensions: 3.5 cm (width) x 4.5 cm (height)
   Background: White or light colored

2. Signature:
   Format: JPEG/JPG only
   Size: Between 10 KB to 40 KB
   Dimensions: 3.5 cm (width) x 1.5 cm (height)
   Note: Use only black or blue pen

3. Identity proof copy:
   Acceptable documents: Aadhaar Card / Passport / Driving License / PAN Card
   Format: PDF only
   Size: Maximum 1 MB
   Note: Document should be clear and readable

4. Educational qualification certificates:
   Format: PDF only
   Size: Maximum 2 MB per document
   Note: All required certificates must be uploaded`;

const lines = upscText.split('\n').filter(line => line.trim());
console.log('📝 All lines:');
lines.forEach((line, i) => {
  console.log(`${(i + 1).toString().padStart(2)}: "${line}"`);
});

// Test document pattern matching
const docPatterns = [
  /^(\d+\.\s*)?(.+?):\s*(.+)$/i,
  /^(\d+\.\s*)([^:]+):\s*$/i,
  /^(\d+\.\s*)?(.+?)\s*-\s*(.+)$/i
];

const requirementKeywords = [
  'format', 'size', 'dimensions', 'background', 'note', 'acceptable documents',
  'maximum', 'minimum', 'between', 'width', 'height', 'color', 'colour'
];

console.log('\n🔍 Testing pattern matches:');
lines.forEach((line, i) => {
  if (!line || 
      (line.toLowerCase().includes('document') && line.toLowerCase().includes('required')) ||
      line.toLowerCase().includes('examination')) {
    console.log(`${(i + 1).toString().padStart(2)}: SKIP - "${line}"`);
    return;
  }
  
  for (const [patternIndex, pattern] of docPatterns.entries()) {
    const match = line.match(pattern);
    if (match) {
      let docType = '';
      if (match[2]) {
        docType = match[2].trim();
      } else if (match[1] && !match[2]) {
        docType = match[1].trim();
      }

      const isRequirementProperty = requirementKeywords.some(keyword => 
        docType.toLowerCase().includes(keyword)
      );

      console.log(`${(i + 1).toString().padStart(2)}: MATCH pattern ${patternIndex + 1} - "${line}"`);
      console.log(`     DocType: "${docType}", IsRequirement: ${isRequirementProperty}`);
      break;
    }
  }
});