// Quick test for UPSC format parsing
const testText = `Document Requirements for UPSC Civil Services Examination 2025:

Photograph:
Format: JPEG/JPG only
Size: Between 20 KB and 300 KB
Dimensions: 3.5 cm (width) x 4.5 cm (height)
Description: Recent color photograph with white background
Mandatory: Yes

Signature:
Format: JPEG/JPG only
Size: Between 20 KB and 300 KB
Dimensions: Approximately 3.5 cm (width) x 1.5 cm (height)
Description: Handwritten signature in black ink on white paper
Mandatory: Yes`;

// Test the parsing logic
console.log('Testing UPSC format parsing...');
console.log('Input text length:', testText.length);
console.log('Lines:', testText.split('\n').length);

// Extract document headers
const lines = testText.split('\n').filter(line => line.trim());
console.log('Filtered lines:', lines.length);

const docHeaders = lines.filter(line => {
  const trimmed = line.trim();
  return /^([A-Za-z\s]+(?:\([^)]*\))?):\s*$/i.test(trimmed) && 
         !trimmed.toLowerCase().includes('examination') &&
         !trimmed.toLowerCase().includes('requirements');
});

console.log('Detected document headers:', docHeaders);

// Test format parsing
const formatText = 'Format: JPEG/JPG only';
const formatMatch = formatText.match(/(jpeg\/jpg|jpg\/jpeg|jpeg|jpg|png|pdf)/gi);
console.log('Format match:', formatMatch);

// Test size parsing
const sizeText = 'Size: Between 20 KB and 300 KB';
const sizeMatch = sizeText.match(/between\s*(\d+(?:\.\d+)?)\s*(kb|mb|gb)\s*and\s*(\d+(?:\.\d+)?)\s*(kb|mb|gb)/gi);
console.log('Size match:', sizeMatch);

// Test mandatory parsing
const mandatoryText = 'Mandatory: Yes';
const mandatoryMatch = mandatoryText.toLowerCase().includes('mandatory: yes');
console.log('Mandatory match:', mandatoryMatch);

const result = parseDocumentRequirements(upscText);
console.log('\n📋 Final Parsed Result:');
console.log('=======================');
console.log(JSON.stringify(result, null, 2));
console.log('✅ Test completed. Check the parsing results above.');